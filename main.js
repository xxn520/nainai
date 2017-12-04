var superagent = require('superagent')
var express = require('express')
var fs = require('fs')
var path = require('path')
var bodyParser = require('body-parser')

var app = express()

app.use(express.static('node_modules'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, './index.html'))
})

app.post('/nainaideipachong', (req, res, next) => {
  var cookie = req.body.cookie
  var start = req.body.start
  var end = req.body.end
  var codes = req.body.codes.split('\r\n')
  var result = {}
  var count = 0
  codes.forEach((code) => {
      result[code] = ""
      superagent.get(`http://box.in66.co/admin/monc/machine-status-list?date=${encodeURIComponent(start).replace('%2B', '+')}&date-to=${encodeURIComponent(end).replace('%2B', '+')}&code=${code}`)
      .set('cookie', cookie)
      .end((err, sres) => {
        if (err) {
          console.log(code);
          return next(err)
        }
        var regex = /<script>series=([\s\S]*?)<\/script>/g

        var series = unescape(regex.exec(sres.text)[1].replace(/\\u/g, "%u"));
        
        var data = { 
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
            
        var sum = 0;
        
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
