const express = require('express');
const AWS = require("aws-sdk");
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const bodyParser = require('body-parser');
// const upload = require('express-fileupload');
const { PORT } = process.env;
const upload = require('./middlewares/multer.js');

// app.use(upload());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/uploadVideo', upload.single('video'), (req, res) => {
    // const file = req.files.file;
    // const fileName = file.name;
    // file.mv('./uploads/'+fileName,(err)=>{
    //     if(err){
    //         res.send(err)
    // }else{
    // return res.send('video uploaded')
    // }
    // })
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
        const filename = req.file.filename;
        const fileContent = fs.readFileSync(req.file.path);
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${filename}.mp4`,
            Body: fileContent,
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.log(err.message);
            }
            console.log(data.Location);
        });
        return res.json({ msg: "file successfully uploded.." });
    } catch (err) {
        console.log(err.message);
    }
})
app.get('/download', async (req, res) => {
    const fileUrl = "https://forvideouploading.s3.ap-south-1.amazonaws.com/78f33ced231ffdd809eec91902841a15.mp4"
    const fileName = path.basename(fileUrl);
    const localFilePath = path.resolve(__dirname, "downloads", fileName);
    let response = await axios({
        url: fileUrl,
        method: 'get',
        responseType: 'stream'
    })
    const w = response.data.pipe(fs.createWriteStream(localFilePath));
    w.on('finish', () => {
        console.log('Successfully downloaded file!');
    });
})
app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
})