const superagent = require('superagent')
const cheerio = require('cheerio')
const express = require('express')
const fs = require('fs')

const app = express()

const codes = [
  "B0213808",
  "B0213814",
  "B0213831",
  "B0213832",
  "B0213861",
  "R030009",
  "R030012",
  "R030017",
  "R030008",
  "R030015",
  "B0215573",
  "B0215574",
  "B0211988",
  "B0211973",
  "B0211974",
  "B0211992",
  "B0211972",
  "B0211982",
  "B0211967",
  "B0211997",
  "B0211998",
  "R030020",
  "R030021",
  "R030022",
  "R030023",
  "R030024",
  "R030025",
  "R030026",
  "R030027",
  "R030028",
  "R030029",
  "R030030",
  "B0214702",
  "B0213016",
  "B0212029",
  "B0210501",
  "B0212296",
  "B0210506",
  "B0211681",
  "B0212037",
  "B0212036",
  "B0212038",
  "B0210499",
  "B0211678",
  "B0212031",
  "B0212055",
  "B0211696",
  "B0212022",
  "B0212056",
  "B0212057",
  "B0212058",
  "B0212059",
  "B0212060",
  "B0212061",
  "B0212062",
  "B0212063",
  "B0212064",
  "B0212065",
  "B0212066",
  "B0212067",
  "B0212068",
  "B0212069",
  "B0212070",
  "B0212071",
  "B0212072",
  "B0212073",
  "B0212074",
  "B0212075",
  "B0212076",
  "B0212077",
  "B0212078",
  "B0212079",
  "B0212080",
  "B0212081",
  "B0212082",
  "B0212083",
  "B0212084",
  "B0212085",
  "B0212086",
  "B0212087",
  "B0212088",
  "B0212089",
  "B0212090",
  "B0212091",
  "B0212092",
  "B0212093",
  "B0212094",
]

app.get('/', (req, res, next) => {
  const result = {}
  let count = 0
  codes.forEach((code) => {
      result[code] = ""
      superagent.get(`http://box.in66.co/admin/monc/machine-status-list?date=2017-06-02+00%3A00%3A00&date-to=2017-06-10+00%3A00%3A00&code=${code}`)
      .set('cookie', '')
      .set('cookie', '')
      .end((err, sres) => {
        if (err) {
          return next(err)
        }
        const regex = /<script>series=([\s\S]*?)<\/script>/g
        
        const series = unescape(regex.exec(sres.text)[1].replace(/\\u/g, "%u"));

        const data = {
            "正常": /\["正常[\s\S]*?,([\d]*)]/g.exec(series)[1],
            "没有打印机": /\["没有打印机[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "缺纸": /\["缺纸[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "缺墨": /\["缺墨[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "打印机错误": /\["打印机错误[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "离线": /\["离线[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "服务器错误": /\["服务器错误[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "卡纸": /\["卡纸[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "其他状态": /\["其他状态[\s\S]*?,([\d]*)\]/g.exec(series)[1],
            "磁盘已满": /\["磁盘已满[\s\S]*?,([\d]*)\]/g.exec(series)[1],
        }

        let sum = 0;

        Object.keys(data).forEach((key, i) => {
            sum += +data[key]
        })
        count ++
        result[code] = (`${code}: ${sum !== 0 ? ((data['正常'] * 100/sum).toFixed(2)) : '0.00'}%`)
        if (codes.length === count) {
          res.send(codes.map((code) => {
              return result[code]
          }).join('<br>'))
        }
      })
  })
})

app.listen(3000, function () {
    console.log('app is listening at port 3000');
})