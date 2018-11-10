import * as firebase from "firebase";
import {StorageOptions, StorageProvider} from '../types';
import {ConsoleLogger as Logger} from '@aws-amplify/core';

const logger = new Logger('StorageClass: firebase');

let config;




export default class FirebaseProvider implements StorageProvider{
    
    static category = 'Storage';
    static providerName = 'Firebase';
    /**
     * @private
     */
    private _config;

    constructor(config?: StorageOptions) {
        this._config = config ? config: {};
    }

    public getCategory(): string {
        return FirebaseProvider.category;
    }

    getProviderName(): string {
        return FirebaseProvider.providerName;
    }


    public configure(config1?): object {
        logger.debug('configure Storage', config1);
        const opt = Object.assign({}, this._config, config1);
        this._config = Object.assign({}, this._config, opt);
        if (!this._config.bucket) { logger.debug('Do not have bucket yet'); }

         config = {
            apiKey: this._config.credentials.apiKey,
            authDomain: this._config.credentials.authDomain,
            databaseURL: "https://try-storage-221618.firebaseio.com",
            projectId: this._config.credentials.projectId,
            storageBucket: this._config.bucket,
            messagingSenderId: this._config.credentials.messagingSenderId
          };

        firebase.initializeApp(config);
        return this._config;
    }

    public async put(key: string, object, config?): Promise<Object> {
        firebase.initializeApp(config);
        const storageRef = firebase.storage().ref();

        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level } = opt;
        const { contentType, contentDisposition, cacheControl, expires, metadata } = opt;
        const type = contentType ? contentType : 'binary/octet-stream';
        return new Promise<any>((res,rej)=> {
            storageRef.child(key).put(object,{'contentType': type})
            .then (data =>{ 
                console.log(data);
                res(data);
                }).catch(err => {
                    console.log(err);
                   rej(err);
                });
        });
    }

    public async get(key: string, config?): Promise<String|Object> {
        firebase.initializeApp(config);
        const storageRef = firebase.storage().ref();

        return new Promise<any>((res,rej)=>{
            const starsRef = storageRef.child(key);
            starsRef.getDownloadURL().then(function(url){
                console.log(url);
                res(url);
              }).catch(function(error) {
                console.log(error);
                rej(error);
              });
        });
    } 

    public async remove(key: string, config?): Promise<any> {
        firebase.initializeApp(config);
        const storageRef = firebase.storage().ref();
        return new Promise<any>((res,rej)=>{
            const desertRef = storageRef.child(key);
            desertRef.delete().then (function(){
                console.log("file deleted successfuly");
                res("file deleted successfuly");
              }).catch(function(err){
                  console.log(err);
                rej(err);});
        });    
    }

    public async list(path, config?): Promise<any> {
        return new Promise<any>((res,rej)=>{
            // code for list here. 
        });
    }
}
