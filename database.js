console.log('Initiation firebase')
const firebaseApp = require('firebase/app');
const firebaseDatabase = require('firebase/database')
const firebaseAuth = require('firebase/auth')


const firebaseConfig = {
    apiKey: "AIzaSyAfVj-IOlLQNBi4CmHUIKBq7v-hMKXbBHM",
    authDomain: "hangout-bot-ca69c.firebaseapp.com",
    databaseURL: "https://hangout-bot-ca69c-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "hangout-bot-ca69c.appspot.com",
    appId: "1:384036425228:web:3ad842f7419988e7f0e829",
    projectId: "hangout-bot-ca69c",
    messagingSenderId: "384036425228",
    measurementId: "G-H8DT7H32C5",
    provider: "anonymous",
    uid: "ff4817a7-2af6-4bba-9447-660645b80a50"
};

const app = firebaseApp.initializeApp(firebaseConfig)

const database = firebaseDatabase.getDatabase(app)
const auth = firebaseAuth.getAuth(app)
console.log('Firebase initiated')

const push = firebaseDatabase.push
const child = firebaseDatabase.set
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
                        callback(path, snapshot.val().value += 1)
                    } else if (operation == '--') {
                        callback(path, snapshot.val().value -= 1)
                    }
                }
                resolve(snapshot.val())

            } else {
                if (callback) {
                    callback(path, 1)
                }
                resolve(undefined)
            }
        }).catch(error => {
            console.log(error)
            reject(error)
        });
    });
}

function setData(path, value) {
    if (value == '++') {
        getData(path, setData, key, '++')
        return
    } else if (value == '--') {
        getData(path, setData, key, '--')
    }
    console.log(`Setting ${path} to ${value}`)
    set(ref(database, path), value);
}

let databaseFuncs = {
    'set': setData,
    'get': getData
}

module.exports = databaseFuncs