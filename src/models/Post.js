const mongoose = require('mongoose');
const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createdAt:{
        type: Date,
        default: Date.now,
    }
});

PostSchema.pre("save", function() {
    if (!this.url) {
      this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
  });

PostSchema.pre("deleteOne", { document: true }, function(){
    console.log("entrou")
    if(process.env.STORAGE_TYPE == 's3'){
        return s3.deleteObject({
            Bucket: 'uploadfilesproject',
            Key: this.schema
        }).promise()
    } else {
        console.log("this: ")
        console.log(this.key)
        return promisify(fs.unlink)(
            path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
          );
    }
});

module.exports = mongoose.model('Post', PostSchema)