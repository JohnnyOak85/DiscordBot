const { readdirSync, pathExistsSync, outputFileSync, readJsonSync, writeJsonSync } = require('fs-extra');

async function readDir(name) {
    try {
        const dir = readdirSync(`./${name}`);
        return dir;
    } catch (error) {
        throw error
    }
}

async function ensureDoc(guild) {
    try {
        const path = `./docs/guilds/guild_${guild}.json`;

        if (!pathExistsSync(path)) {
            outputFileSync(path, "{}");
        }

        const doc = readJsonSync(path);

        return doc;
    } catch (error) {
        throw error
    }
}

async function saveDoc(guild, doc) {
    try {
        writeJsonSync(`./docs/guilds/guild_${guild}.json`, doc);
    } catch (error) {
        throw error
    }
}

async function getList(guild) {
    try {
        const doc = readJsonSync(`./docs/guilds/guild_${guild}.json`);
        return doc.members;
    } catch (error) {
        throw error
    }
}

async function saveList(guild, members) {
    try {
        const path = `./docs/guilds/guild_${guild}.json`
        const doc = readJsonSync(path);

        doc.members = members;
        writeJsonSync(path, doc);
    } catch (error) {
        throw error
    }
}

module.exports = {
    readDir: readDir,
    ensureDoc: ensureDoc,
    saveDoc: saveDoc,
    getList: getList,
    saveList: saveList,
}