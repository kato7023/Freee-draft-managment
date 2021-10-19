function myFunction() {
  //TODO: BIG
  // とりあえず複数事業所対応をどうするか？
  // 最初に条件設定をするしか無いか？
  // 条件設定：事業所／取得範囲／・・・→　freeeから取引取得　SSにsetValues
}

function getRecievables() {
  getDrafts_('recievable', new ReadSpreadsheet());
}

function getPayables() {
  getDrafts_('payable', new ReadSpreadsheet());
}

function getEndorsed() {
  getDrafts_('endorsed', new ReadSpreadsheet());
}

function getDiscounted() {
  getDrafts_('discounted', new ReadSpreadsheet());
}

function getAllDrafts() {
  const ss = new ReadSpreadsheet();
  getDrafts_('recievable', ss);
  getDrafts_('payable', ss);
  getDrafts_('endorsed', ss);
  getDrafts_('discounted', ss);
}

/**
 * 各手形の条件設定を行い、configsオブジェクトを返す
 * @param {ReadSpreadsheet} ss
 * @return {Object} configs 設定オブジェクト
 */
function getConfigs_(ss) {

  //settingオブジェクトを定義
  //TODO:↓設定シートなどで共通設定は選択できるよにするか
  const company = '三国産業株式会社';
  const flag_tag = '手形債権台帳';
  const start_issue_date = new Date('2015/1/1');
  const end_issue_date = new Date('2023/1/1');

  const configs = {
    recievable: {
      flag_tag_id: F.tag(flag_tag, ss),
      company: company,
      acc_items_detail: ['売上高', '売上高（営業）'],
      acc_items_renew: ['受取手形', '受取債権'],
      start_issue_date: start_issue_date,
      end_issue_date: end_issue_date,
      type: 'income'
    },
    payable: {
      flag_tag_id: F.tag(flag_tag, ss),
      company: company,
      acc_items_detail: ['仕入高', '仕入高（営業）', '車両運搬具', '機械装置'],
      acc_items_renew: ['支払手形', '設備支払手形'],
      start_issue_date: start_issue_date,
      end_issue_date: end_issue_date,
      type: 'expense'
    },
    endorsed: {
      flag_tag_id: F.tag(flag_tag, ss),
      company: company,
      acc_items_detail: ['仕入高', '仕入高（営業）'],
      acc_items_renew: ['裏書手形'],
      start_issue_date: start_issue_date,
      end_issue_date: end_issue_date,
      type: 'expense'
    },
    discounted: {
      flag_tag_id: F.tag(flag_tag, ss),
      company: company,
      acc_items_detail: ['割引手形'],
      acc_items_renew: [],
      start_issue_date: start_issue_date,
      end_issue_date: end_issue_date,
      type: 'income'
    }
  }

  return configs;
}

/**
 * getDrafts freee取引から手形取引を取得する
 * @param {string} type 受取手形'recievable' 支払手形'payable' 裏書手形'endorsed' 割引手形'discounted'
 * @param {ReadSpreadsheet} ss
 * @return this
 */
function getDrafts_(type, ss) {

  const types = ['recievable', 'payable', 'endorsed', 'discounted'];
  if (!types.includes(type)) throw 'typeの指定が不正です。';
  console.log(`${type}のシートを更新します。`);

  //設定オブジェクト読み込み
  const conf = getConfigs_(ss)[type];

  //URLfechして、取引データを取得
  const deals = getDeals_(conf, ss);

  //dealsをフィルターする
  const filteredDeals = filterDeals_(deals, type, conf, ss);

  //filteredDealsを処理して2次元配列valuesに格納
  const values = makeValues_(filteredDeals, type, conf, ss);


  //TODO:valuesのソートを実施

  //最終スプレッドシートに書き込み
  //NOTE:後でss.saveToSSメソッドに切り替える
  ss[`sht_${type}`].getRange(4, 1, values.length, values[0].length).setValues(values);

}

/**
 * 取引を勘定科目で絞り込み取得(部門やメモタグで絞り込みは出来ない)
 * @param {Object} conf
 * @param {ReadSpreadsheet} ss
 * @return {Array} deals 取得結果の格納された配列
 */
function getDeals_(conf, ss) {

  const deals = [];

  for (const accitem of conf.acc_items_detail) {

    const req = new Request('deals');

    req  //URL作成
      .addParam('company_id', F.company(conf.company, ss))
      .addParam('account_item_id', F.accItem(accitem, ss))
      .addParam('start_issue_date', F.date(conf.start_issue_date))
      .addParam('end_issue_date', F.date(conf.end_issue_date));

    //リクエスト実施
    const res = req.pageRequest('deals');

    //フィルターの結果を、responsesに追加する
    deals.push(...res);
  }

  return deals;
}

/**
 * DealsをConfに則って各種条件でフィルターしつつ、対象行にマーキングする
 * @param {Array} 取引の配列
 * @param {string} type
 * @param {Object} conf
 * @param {ReadSpreadsheet} ss
 * @return {Array} filteredDeals
 */
function filterDeals_(deals, type, conf, ss) {
  //各種絞り込み、typeで処理分岐

  //ヒットした回数を記録する
  let detail_num = 0;

  //フィルター結果格納用の配列を用意
  let filteredDeals = [];

  switch (type) {
    case 'recievable':
    case 'payable':
    case 'endorsed':

      //判定用の勘定科目配列
      const target_acc_items = [];
      for (const accitem of conf.acc_items_renew) {
        target_acc_items.push(F.accItem(accitem, ss));
      }

      //３段ループで全取引の＋更新明細行を調べつつ、※対象のマーキングを行う※
      for (const deal of deals) {  //各取引を走査
        if (!deal.renews) continue;  //＋更新を含まない取引を除外する
        deal.hasTarget = false;
        deal.target_num = 0;
        for (const renew of deal.renews) {  //各＋更新を走査
          for (const detail of renew.details) {  //＋更新の各明細行を走査
            //明細行の勘定科目は、対象勘定科目と一致するか？
            if (target_acc_items.includes(detail.account_item_id)) {
              deal.hasTarget = true;
              deal.target_num++;
              detail_num++;
              detail.target = true;  //マーキング
            }
          }
        }
        if (deal.hasTarget) filteredDeals.push(deal);
      }
      console.log(`filterDeals_/${type}${conf.acc_items_renew}の結果、${filteredDeals.length}件の取引、${detail_num}件の明細行が抽出されました。`);
      //       for (const accitem of conf.acc_items_renew) {
      //         //＋更新の勘定科目で絞り込む
      //         const filtered = deals.filter(deal => {
      //           if (!deal.renews) {
      //             return false; //＋更新を含まない取引を除外する
      //           } else {
      //             deal.target_num = 0; //対象行が含まれる数を格納するプロパティを追加
      //             return deal.renews.some(renew => //renews配列の各要素に対して
      //               renew.details.some(detail => {  //その中のdetails配列の各要素（＝＋更新の各行に相当）
      //                 //＋更新の勘定科目がconf.acc_items_renewsを含むか判定
      //                 if (detail.account_item_id == F.accItem(accitem, ss)) {
      //                   deal.target_num = deal.target_num + 1;
      //                   hit++;
      //                   detail.target = true; //対象行のマーキング
      // console.log(deal.target_num);
      //                   return true;
      //                 }
      //               })
      //             );
      //           }
      //         });
      // console.log(`filterDeals_/${accitem}の結果、${filtered.length}件の取引、${hit}件の明細行が抽出されました。`);
      //         filteredDeals.push(...filtered);
      //       }
      break;
    case 'discounted':

      //２段ループで全取引の明細行を調べつつ、※対象のマーキングを行う※
      for (const deal of deals) {  //各取引を走査
        deal.hasTarget = false;
        deal.target_num = 0;
        for (const detail of deal.details) {  //各明細行を走査
          //メモタグ手形債権台帳を含まないか
          if (!detail.tag_ids.includes(conf.flag_tag_id)) {
            deal.hasTarget = true;
            deal.target_num++;
            detail_num++;
            detail.target = true;  //マーキング
          }
        }
        if (deal.hasTarget) filteredDeals.push(deal);
      }
      console.log(`filterDeals_/${type}の結果、${filteredDeals.length}件の取引、${detail_num}件の明細行が抽出されました。`);



      // filteredDeals = deals.filter(deal => {
      //   deal.target_num = 0; //対象行が含まれる数を格納するプロパティを追加
      //   deal.details.some(detail => { //メモタグ手形債権台帳を含まないで絞り込み
      //     if (!detail.tag_ids.includes(conf.flag_tag_id)) {
      //       deal.target_num++;
      //       detail.target = true; //対象行のマーキング
      //       return true;
      //     }
      //   })
      // });
      break;
    default: throw 'something has gone wrong';
  }
  return filteredDeals;
}


/**
 * FilteredDealsデータを渡すと、typeごとに整理して、２次元配列valuesに格納して返す
 * @param {Array} filteredDeals - filteredDeals（取引の配列）
 * @param {string} type
 * @param {Object} conf
 * @param {ReadSpreadsheet} ss 
 * @return {Array} values
 */
function makeValues_(filteredDeals, type, conf, ss) {

  const values = [];

  for (const deal of filteredDeals) {

    //dealごとに、必要なプロパティーを取得
    //r.dls : company_id, due_amount, issue_date, due_date, partner_id, status
    //r.dts : id, account_item_id, accitem_name, tag_ids, tag_names, amount, description
    //r.rns : update_date, update_Date, id, account_item_id, accitem_name, tag_ids, tag_names, amount, description

    const rArr = extractDealProperties_(deal, conf, ss);

    //FIX:rの形式を治す必要あり！！
    for (const r of rArr) {
      //typeごとに処理を分岐して、valuesを整形していく
      switch (type) {
        case 'recievable':
          values.push([r.rns.id, r.dls.issue_Date, r.dls.partner_name, r.rns.tag_names, r.rns.amount, r.dls.due_Date, r.rns.description]);
          break;
        case 'payable':
          const dsrpt = r.rns.description;
          if (dsrpt && dsrpt.match(/三菱/)) r.rns.bankaccount = '三菱当座9000298';
          else if (dsrpt && dsrpt.match(/三井/)) r.rns.bankaccount = '三井当座2029065';
          else r.rns.bankaccount = '？？？';
          values.push([r.rns.id, r.dls.issue_Date, r.dls.partner_name, r.rns.tag_names, r.rns.amount, r.rns.bankaccount, r.dls.due_Date, r.rns.description]);
          break;
        case 'endorsed':
          values.push([r.rns.id, r.rns.tag_names, '元取引先 ', '元金額', '受領日', '期日', r.dls.partner_name, r.rns.amount, r.rns.description]);
          break;
        case 'discounted':
          values.push([r.dts.id, r.dts.tag_names, '元手形取引先', r.dts.amount, '口座', '予定日', '手数料', '利息']);
          break;
        default: throw 'something has gone wrong';
      }
    }
  }
  return values;
}

/**
 * FilteredDealsデータを渡すと、必要要素を抜き出してオブジェクトに格納して返す
 * @param {Object} deal - getFilteredResponse_のresponses配列の各要素（１つの取引に相当）
 * @param {Object} conf
 * @param {ReadSpreadsheet} ss 
 * @return {Arr} rArr
 */
function extractDealProperties_(deal, conf, ss) {

  //対象行のrを格納するための配列
  let rArr = [];

  //NOTE:deal.target_num = この取引に含まれる、対象行の数 filterDeals_関数で付与している
  //filterDealsを通過していないDealsではエラーが出るはず
  //FIX :detailsにもrenewsにも対象行マーキングが存在する場合、不具合が出るはずだが、
  //     とりあえず、受手、支手、廻手と、割手は重複しないだろう・・・と思う
  for (let i = 0; i < deal.target_num; i++) {

    //対象行のデータ保持用のオブジェクト
    let r = {
      dls: {}, //dealsエリアの内容を格納
      dts: {}, //detailsエリアの内容を格納
      rns: {}  //renewsエリアの内容を格納
    };

    //dealレベル（一番上）の処理
    const { company_id, due_amount, issue_date, due_date, partner_id, status } = deal;
    const dls = { company_id, due_amount, issue_date, due_date, partner_id, status }
    Object.assign(r.dls, dls);

    //detailsパートの処理
    for (const detail of deal.details) {

      if (!detail.target) continue; //対象detailにマーキングがなければ、スキップ

      //各要素をオブジェクトrに代入
      const { id, account_item_id, tag_ids, amount, description } = detail;
      const dts = { id, account_item_id, tag_ids, amount, description };
      dts.accitem_name = F.accItem(dts.account_item_id, ss);
      Object.assign(r.dts, dts);

      //処理が終わったら、マーキングをOFFして一度forを抜ける
      detail.target = false; //対象detailのマーキングをオフ
      break;
    }

    //renewのパートの処理
    if (deal.renews) { //renews自体存在しなければスキップ

      for (const renew of deal.renews) {

        //renewsレベル（renewの一番上）の処理
        if (renew.renew_target_type != 'accrual') continue;
        let inProgress = true;

        for (const renewDetail of renew.details) {

          if (!renewDetail.target) continue; //対象renewDetailにマーキングがなければ、スキップ

          const { update_date } = renew;
          const { id, account_item_id, tag_ids, amount, description } = renewDetail;
          const rns = { update_date, id, account_item_id, tag_ids, amount, description };
          rns.accitem_name = F.accItem(rns.account_item_id, ss);
          Object.assign(r.rns, rns);

          //処理が終わったら、マーキングをOFFして一度forを抜ける
          renewDetail.target = false; //対象detailのマーキングをオフ
          inProgress = false;
          break;
        }
        //renewDetailの処理が完了していたらfor抜ける
        if (!inProgress) break;
      }
    }

    //↓最終整形処理↓

    //取引先名
    if (r.dls.partner_id) r.dls.partner_name = F.partner(r.dls.partner_id, ss);

    //日付を処理　※dateはfreee形式　DateはDateオブジェクト
    if (r.dls.issue_date) r.dls.issue_Date = F.revDate(r.dls.issue_date);
    if (r.dls.due_date) r.dls.due_Date = F.revDate(r.dls.due_date);
    if (r.rns.update_date) r.rns.update_Date = F.revDate(r.rns.update_date);

    //タグ（手形番号）を処理
    const areas = ['dts', 'rns'];
    for (const area of areas) {
      if (r[area].tag_ids) r[area].tag_names = r[area].tag_ids
        .map(tag => {
          if (tag != conf.flag_tag_id) {
            return F.tag(tag, ss);
          }
        })
        .filter(name => name)
        .join(',');
    }

    //対象行のrをrsに格納
    rArr.push(r);

  }

  return rArr;
}
