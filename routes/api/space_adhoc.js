const db = require('../../models/db');
// const uuidv4 = require('uuid/v4');
const express = require('express');
const router = express.Router({ mergeParams: true });
const crypto = require('crypto');

/*
  If the space does not exist;
  create it; make it public;
  redirect the user;
 */
router.get('/', async (req, res, next) => {


    const id = req.params.id;
    console.log('finidng ', id);
    let space = await db.Space.findOne({
        where: {
            "_id": id
        }
    });

    if (!space) {
        space = await createPublicSpace(id);
    }

    if (space.access_mode !== "public") {
        res.status(403).json({ "error": "not authorized" });
        return;
    }

    res.redirect("/spaces/" + id + "?spaceAuth=" + space.edit_hash);
});

async function createPublicSpace(id) {
    attrs = {};
    attrs._id = id;
    attrs.creator_id = null; // req.user._id;
    attrs.edit_hash = crypto.randomBytes(64).toString('hex').substring(0, 7);
    attrs.name = id;
    attrs.edit_slug = id;
    attrs.access_mode = 'public';
    let newSpace = await db.Space.create(attrs);

    return newSpace;


}

module.exports = router;
