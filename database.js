console.log('Initiation firebase')
require('dotenv').config()
const firebaseApp = require('firebase/app');
const firebaseDatabase = require('firebase/database')
const firebaseAuth = require('firebase/auth')


const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: "hangout-bot-ca69c.firebaseapp.com",
    databaseURL: "https://hangout-bot-ca69c-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "hangout-bot-ca69c.appspot.com",
    appId: process.env.appId,
    projectId: "hangout-bot-ca69c",
    messagingSenderId: "384036425228",
    measurementId: "G-H8DT7H32C5",
    provider: "anonymous",
    uid: process.env.UID
};

const app = firebaseApp.initializeApp(firebaseConfig)

const database = firebaseDatabase.getDatabase(app)
const auth = firebaseAuth.getAuth(app)
console.log('Firebase initiated')

const push = firebaseDatabase.push
const child = firebaseDatabase.set
const onValue = firebaseDatabase.onValue
const ref = firebaseDatabase.ref
const get = firebaseDatabase.get
const set = firebaseDatabase.set

async function getData(path, callback, operation) {
    return new Promise((resolve, reject) => {
        const pathRef = ref(database, path)
        get(pathRef).then((snapshot) => {
            if (snapshot.exists() && snapshot.val()) {
                if (callback) {
                    if (operation == '++') {
                        callback(path, snapshot.val() + 1)
                    } else if (operation == '--') {
                        callback(path, snapshot.val() - 1)
                    }
                }
                resolve(snapshot.val())

            } else {
                if (callback) {
                    callback(path, 1)
                    return
                }
                resolve(undefined)
            }
        }).catch(error => {
            console.warn(error)
            reject(error)
        });
    });
}

function setData(path, value) {
    if (value == '++') {
        getData(path, setData, '++')
        return
    } else if (value == '--') {
        getData(path, setData, '--')
        return
    }
    console.log(`Setting ${path} to ${value}`)
    set(ref(database, path), value);
}

function create_event_listener(path, key, callback) {
    onValue(ref(database, path + '/' + key), (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
            callback(key, snapshot.val())
        }
    });
}

let databaseFuncs = {
    'set': setData,
    'get': getData,
    'eventListener': create_event_listener,
}

module.exports = databaseFuncs