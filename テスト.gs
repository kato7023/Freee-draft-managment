function myFunction() {
  const a = new ApiRequest();
}

function myFunction2() {
  const ss = new ReadSpreadsheet();
  // // ss.saveToSS(b.vals_recievable,'recievable');
  // ss.renewAllDatas(452906, 'tags');
  console.log(F.partner(2818760, ss));
  console.log(F.company('三国産業株式会社', ss));
  console.log(F.accItem('受取債権', ss));
  console.log(F.item(154437844, ss));
  console.log(F.section(112401, ss));
  console.log(F.tag('3308新東名厚木南IC', ss));
}

function myFunction3() {
  const type = 'partners';
  const firstLtr = type.slice(0, 1);
  const typeCap = firstLtr.toUpperCase() + type.replace(firstLtr, '');
  const typeNoS = type.slice(0, -1);
  console.log(firstLtr)
  console.log(firstLtr.toUpperCase());
  console.log(typeCap);
  console.log(typeNoS);
}

function myFunction4() {
  const req = new Request('companies');
  console.log(req.token);
  // console.log(req.requestGet());
}

function myFunction5() {
  const ss = new ReadSpreadsheet();
  const req = new Request('deals');
  req.addParam('company_id', F.company('三国産業株式会社', ss))
    .addParam('account_item_id', F.accItem('受取手形', ss))
    .addParam('start_issue_date', F.date(new Date('2020/1/1')))
    .addParam('end_issue_date', F.date(new Date('2020/1/31')));
  console.log(req.url);

  req.changeParam('what_the_fuck', F.accItem('受取債権', ss));
  console.log(req.url);
}

function myFunction6() {
  const test = [{
    id: 1144273193,
    account_item_id: 74382825,
    tax_code: 2,
    item_id: 111045784,
    section_id: 112401,
    tag_ids: [7117434, 10402530],
    amount: 830000,
    vat: 0,
    description: '8/20受取',
    entry_side: 'credit'
  },
  {
    id: 1346435438,
    account_item_id: 71248948,
    tax_code: 136,
    item_id: 72016705,
    section_id: null,
    tag_ids: [],
    amount: 770,
    vat: 70,
    description: '',
    entry_side: 'debit'
  }];

  if (test.length != 1) {
    for (const [detail, i] of test) {
      const judge = detail.account_item_id == F.accItem('受取手形') ||
        detail.account_item_id == F.accItem('受取債権');
      if (!judge) test.splice(i, 1);
    }
    if (test.length != 1) throw '取引の明細行に手形明細が2つ以上登録されています。';
  }

  console.log(test);
}

function postItems_03() {

  const item = {
    company_id: 3169161,
    name: 'テスト品目１０１',
    shortcut1: 'test101',
    shortcut2: 'テスト１０１'
  };

  const url = 'https://api.freee.co.jp/api/1/items';

  const obj = F.requestPost(url, item);

  if (obj.status_code) {
    console.log(`エラーが発生しました：コード${obj.status_code}\nエラー：${JSON.stringify(obj.errors)}`);
  } else {
    console.log(`品目登録に成功しました。\n${JSON.stringify(obj.item)}`);
  };
}

function urltest() {
  const url = new Request('partners');
  // url.addParam('company_id',11111)
  //    .addParam('aaa','bbb')
  //    .addPath('naofumi')
  //    .addPath('kato');
  console.log(url.url);
  // url.addParam('a','b'); →一度GETしたURLを変更しようとするとエラー
  console.log(url.url);
  url.addPage(100, 100);
  console.log(url.page);
  url.addPage(200, 300);
  console.log(url.page);
  url.addPage();
  console.log(url.page);
}

for (const accitem of conf.acc_items_renew) {
  //＋更新の勘定科目で絞り込む
  const filtered = deals.filter(deal => {
    if (!deal.renews) {
      return false; //＋更新を含まない取引を除外する
    } else {
      deal.target_num = 0; //対象行が含まれる数を格納するプロパティを追加
      return deal.renews.some(renew => //renews配列の各要素に対して
        renew.details.some(detail => {  //その中のdetails配列の各要素（＝＋更新の各行に相当）
          //＋更新の勘定科目がconf.acc_items_renewsを含むか判定
          if (detail.account_item_id == F.accItem(accitem, ss)) {
            deal.target_num = deal.target_num + 1;
            hit++;
            detail.target = true; //対象行のマーキング
            return true;
          }
        })
      );
    }
  });
  filteredDeals.push(...filtered);
}
