/**
* create json file from wallet address list in text file (one address per line) and ipfs url and website url
*/
const fs = require('fs');
const path = require('path');
function createMemberFile(ipfsUrl, websiteUrl) {
    const addresses = fs.readFileSync(path.join(__dirname, '../data/member-addresses.txt'));
    // read each address and create json file
    // output will be like this
    // [
    //   {
    //    "address": "0x306be6c562F9E21499C7F36693f3EAFE483F823c",
    //    "image_uri": "ipfs://Qmb9UCEVhTF37noQQa8qmyVF7U4Wj6gytVEQXevKN9NxCg",
    //    "external_uri": "https://guild.xyz/web30-dao"
    //   }
    // ]
    ret = [];
    addresses.toString().split('\n').forEach((address) => {
        // skip empty lines
        if (address.trim() === '') {
            return;
        }
        const member = {
            address: address,
            image_uri: ipfsUrl,
            external_uri: websiteUrl
        };
        ret.push(member);
    });
    fs.writeFileSync(path.join(__dirname, '../data/members.json'), JSON.stringify(ret));
  }

// get ipfsUrl and websiteUrl parameters from command line using command-line-args library
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'ipfsUrl', alias: 'i', type: String },
    { name: 'websiteUrl', alias: 'w', type: String }
];
// call createMemberFile function with ipfsUrl and websiteUrl parameters
const options = commandLineArgs(optionDefinitions);
createMemberFile(options.ipfsUrl, options.websiteUrl);
