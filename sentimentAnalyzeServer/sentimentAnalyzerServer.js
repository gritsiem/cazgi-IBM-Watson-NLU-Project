const express = require('express');
const app = new express();
const dotenv = require('dotenv')
dotenv.config()

function getNLUInstance(){
let api_key = process.env.API_KEY
let api_url = process.env.API_URL

const NLUV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const naturalLanguageUnderstanding = new NLUV1({
  version: '2020-08-01',
  authenticator: new IamAuthenticator({
    apikey: api_key,
  }),
  serviceUrl: api_url,
});

return naturalLanguageUnderstanding;
}
const getEmotion = (params) =>{
 let nlu = getNLUInstance()
 console.log("analyzing emotion")

 const promise = (resolve, reject) =>{

     nlu.analyze(params)
      .then(analysisResults => {
        let resp = analysisResults;
        resolve(resp.result.emotion.document.emotion)
      })
      .catch(err => {
        console.log('error:', err.code);
        if(err.code===422){
            resolve({status:err.code,message:err.message})
        }
        // reject()
      });
 }

 return new Promise(promise)
}
const getSentiment = (params) =>{
 let nlu = getNLUInstance()
 console.log("analyzing sentiment")

 const promise = (resolve, reject) =>{

     nlu.analyze(params)
      .then(analysisResults => {
        let resp = analysisResults;
        console.log(resp.result.sentiment.document.label)
        resolve(resp.result.sentiment.document.label)
      })
      .catch(err => {
        console.log('error:', err.code);
        if(err.code===422){
            resolve(err.message)
        }
        reject()
      });
 }

 return new Promise(promise)
}
app.use(express.static('client'))

const cors_app = require('cors');
app.use(cors_app());

app.get("/",(req,res)=>{
    res.render('index.html');
  });

app.get("/url/emotion", (req,res) => {
const analyzeParams = {
        'url': req.query.url,
        'features': {
            'emotion': {
                'document':true
            }
        }
    };
    let result = getEmotion(analyzeParams)
    result.then((data)=>{
        return res.send(data);
    })
});

app.get("/url/sentiment", (req,res) => {
    const analyzeParams = {
        'url': req.query.url,
        'features': {
            'sentiment': {
                'document':true
            }
        }
    };
    let result = getSentiment(analyzeParams)
    result.then((data)=>{
        return res.send(data);
    })
});

app.get("/text/emotion", (req,res) => {
    const analyzeParams = {
        'text': req.query.text,
        'features': {
            'emotion': {
                'document':true
            }
        }
    };
    let result = getEmotion(analyzeParams)
    result.then((data)=>{
                return res.send(data);
    })
});

app.get("/text/sentiment", async (req,res) => {
    const analyzeParams = {
        'text': req.query.text,
        'features': {
            'sentiment': {
                'document':true
            }
        }
    };
    let result = getSentiment(analyzeParams)
    result.then((data)=>{
        return res.send(data);
    })
    
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

