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

function myAdventure() {

  const arr1 = [1, 2, 3, 4, 5];

  console.log(Array.prototype.push(1));
  //1

  console.log(Array.push(1));

}
// for (const accitem of conf.acc_items_renew) {
//   //＋更新の勘定科目で絞り込む
//   const filtered = deals.filter(deal => {
//     if (!deal.renews) {
//       return false; //＋更新を含まない取引を除外する
//     } else {
//       deal.target_num = 0; //対象行が含まれる数を格納するプロパティを追加
//       return deal.renews.some(renew => //renews配列の各要素に対して
//         renew.details.some(detail => {  //その中のdetails配列の各要素（＝＋更新の各行に相当）
//           //＋更新の勘定科目がconf.acc_items_renewsを含むか判定
//           if (detail.account_item_id == F.accItem(accitem, ss)) {
//             deal.target_num = deal.target_num + 1;
//             hit++;
//             detail.target = true; //対象行のマーキング
//             return true;
//           }
//         })
//       );
//     }
//   });
//   filteredDeals.push(...filtered);
// }

function dammyData() {
  const ss = new ReadSpreadsheet();
  const req = new Request('deals');

  req  //URL作成
      .addParam('company_id', conf.company)
      .addParam('account_item_id', F.accItem(accitem, ss))
      .addParam('start_issue_date', F.date(conf.start_issue_date))
      .addParam('end_issue_date', F.date(conf.end_issue_date));

    //リクエスト実施
    const res = req.pageRequest('deals');


}

function myExploration() {

  //ダミー配列
  const deals = [
    {
      "id":961854614,
      "details":[
        {
          "account_item_id":71248912,
        },
        {
          "account_item_id":71248912,
        },
        {
          "account_item_id":71248912
        }
      ],
      "renews":[
        {
          "details":[
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248939
            }
          ]
        },
        {
          "details":[
            {
              "account_item_id":71248948
            }
          ]
        }
      ]
    },
    {
      "details":[
        {
          "account_item_id":71248912
        },
        {
          "account_item_id":71248912
        },
        {
          "account_item_id":71248912
        },
        {
          "account_item_id":71248912
        }
      ],
      "renews":[
        {
          "details":[
            {
              "account_item_id":108284285
            },
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248939
            }
          ]
        },
        {
          "details":[
            {
              "account_item_id":71248948
            }
          ]
        }
      ]
    },
    {
      "details":[
        {
          "account_item_id":71248912
        },
        {
          "account_item_id":71248912
        }
      ],
      "renews":[
        {
          "details":[
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248939
            }
          ]
        },
        {
          "details":[
            {
              "account_item_id":71248948
            }
          ]
        }
      ]
    },
    {
      "details":[
        {
          "account_item_id":71248912
        }
      ],
      "renews":[
        {
          "details":[
            {
              "account_item_id":74382825
            },
            {
              "account_item_id":71248947
            },
            {
              "account_item_id":71248948
            }
          ]
        }
      ]
    },
    {
      "details":[
        {
          "account_item_id":71248912
        },
        {
          "account_item_id":71248912
        }
      ],
      "renews":[
        {
          "details":[
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248817
            },
            {
              "account_item_id":71248939
            }
          ]
        },
        {
          "details":[
            {
              "account_item_id":71248948
            }
          ]
        }
      ]
    }
  ];
  //ダミー5個終わり

  const filteredDeals1 = [];

  let indexD = 1; 

  for (const deal of deals) {  //各取引を走査

    let indexRS=1;
    console.log(`Forのdeal起動`);

    if (!deal.renews) continue;  //＋更新を含まない取引を除外する
    deal.hasTarget = false;　//マーキングを初期化
    deal.target_num = 0;     //カウントを初期化

    for (const renew of deal.renews) {  //各＋更新を走査
    
      let indexR=1;
      console.log(`Forのrenews起動`);
    
      for (const detail of renew.details) {  //＋更新の各明細行を走査

        console.log(`ForのrenewDetail起動`);            

        //明細行の勘定科目は、対象勘定科目と一致するか？
        if ([71248817,74382825].includes(detail.account_item_id)) {
          deal.hasTarget = true;
          deal.target_num++;
          detail.target = true;  //マーキング
        }
        
        console.log(`[FOR]deal:${indexD}/renews:${indexRS}/detail:${indexR}/judge:${[71248817,74382825].includes(detail.account_item_id)}/deal.target_num:${deal.target_num}`);
        
        indexR++;

      }
      
      indexRS++;
    
    }

    indexD++;

    if (deal.hasTarget) filteredDeals1.push(deal);
  }

  // console.log('！！！！！！！FORループ方式開始！！！！！！！！');
  // for(let i=0;i<filteredDeals1.length;i++) {
  //   console.log(filteredDeals1[i]);
  // }
  // console.log('！！！！！！！FORループ方式終了！！！！！！！！');

    const filteredDeals2 = deals.filter((deal,elemD) => {
      console.log(`メソッドのdeal起動`);
      if (!deal.renews) {
        return false; //＋更新を含まない取引を除外する
      } else {
        deal.hasTarget = false;　//マーキングを初期化
        deal.target_num = 0;     //カウントを初期化
        return deal.renews.some((renew, elemRS) => {//renews配列の各要素に対して
          console.log(`メソッドのrenews起動`);
          renew.details.some((detail, elemR) => {  //その中のdetails配列の各要素（＝＋更新の各行に相当）
            console.log(`メソッドのrenewDetail起動`);
            //＋更新の勘定科目がconf.acc_items_renewsを含むか判定
            if ([71248817,74382825].includes(detail.account_item_id)) {
              deal.hasTarget = true;
              deal.target_num++;
              detail.target = true; //対象行のマーキング
              console.log(`[Method]deal:${elemD+1}/renews:${elemRS+1}/detail:${elemR+1}/judge:${[71248817,74382825].includes(detail.account_item_id)}/deal.target_num:${deal.target_num}`);
              return true;
            } else {
              console.log(`[Method]deal:${elemD+1}/renews:${elemRS+1}/detail:${elemR+1}/judge:${[71248817,74382825].includes(detail.account_item_id)}/deal.target_num:${deal.target_num}`);

            }
          })
        });
      }
    });

  console.log('！！！！！！！反復メソッド方式開始！！！！！！！！');
  for(let i=0;i<filteredDeals2.length;i++) {
    console.log(filteredDeals2[i]);
  }
  console.log('！！！！！！！反復メソッド方式終了！！！！！！！！');
}
