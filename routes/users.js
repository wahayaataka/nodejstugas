const express = require('express');
const app = express();
var ObjectId = require('mongodb').ObjectId;

app.get('/', function(req, res){
    // render to views/indexedDB.ejs
    res.render('./index', {title: 'XIR6'})
})

// Menampilkan data
app.get('/tampil', function(req, res, next){
    // Mengambil data dari database
    req.db.collection('buku').find().sort({"_id": -1}).toArray(function(err, result){

        if (err) {
            req.flash('error', err)
            res.render('user/list', {
                title : 'Daftar buku',
                data: ''
            })
        } else {
            // menampilkan views list.ejs
            res.render('user/list', {
                title : 'Daftar buku',
                data : result
            })
        }
    })
})

// Menampilkan Form Input
app.get('/add', function(req, res, next){
    // Menampilkan add.ejs
    res.render('user/add', {
        title : 'Tambah Data',
        judul : '',
        penulis : '',
        tahun: '',
        harga : ''
    })
})

// Proses input data
app.post('/add', function(req, res, next){
    req.assert('judul', 'judul harus diisi').notEmpty()
    req.assert('penulis', 'Jurusan harus diisi').notEmpty()
    req.assert('tahun', 'tahun harus diisi dengan valid').notEmpty()
    req.assert('harga', 'Nomor harus diisi').notEmpty()

    var errors = req.validationErrors()

    if( !errors){
        var user = {
            judul : req.sanitize('judul').escape().trim(),
            penulis : req.sanitize('penulis').escape().trim(),
            tahun : req.sanitize('tahun').escape().trim(),
            harga : req.sanitize('harga').escape().trim(),
        }

        req.db.collection('buku').insert(user, function(err, result){
            if (err){
                req.flash('error', err)

                // render to user/add
                res.render('user/add', {
                    title : 'Tambah Data',
                    judul : user.judul,
                    penulis : user.penulis,
                    tahun : user.tahun,
                    harga : user.harga
                })
            } else {
                req.flash('Berhasil', 'Data berhasil ditambah')

                // redirect to user list page
                res.redirect('/tampil')
            }
        })
    }
    else { //Display errors to user
        var error_msg = ''
        errors.forEach(error => {
            error_msg += error.msg + '<br>'
        });
        req.flash('error', error_msg)

        res.render('user/add', {
            title : 'Tambah Data',
            judul : req.body.judul,
            penulis : req.body.penulis,
            tahun : req.body.tahun,
            harga : req.body.harga
        })
    }
})

// menunjukkan edit user form
app.get('/edit/(:id)', function(req, res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('buku').find({"_id": o_id}).toArray(function(err, result){
        if(err) return console.log(err)

        // jika data tidak ada
        if (!result){
            req.flash('error', 'User dengan id : ' + req.params.id + 'tidak ditemukan')
            res.redirect('/users')
        }
        else { //jika data ada
            // tampilkan user/edit
            res.render('user/edit', {
                title : 'Edit Data',
                
                id : result[0]._id,
                judul : result[0].judul,
                penulis : result[0].penulis,
                tahun : result[0].tahun,
                harga : result[0].harga
            })
        }
    })
})

// Edit User post action
app.put('/edit/(:id)', function(req, res, next){
    req.assert('judul', 'judul harus diisi').notEmpty()
    req.assert('penulis', 'penulis harus diisi').notEmpty()
    req.assert('tahun', 'tahun harus diisi').notEmpty()
    req.assert('harga', 'Harga harus diisi').isNumeric()

    var errors = req.validationError()

    if( !errors) {

        var user = {
            judul : req.sanitize('judul').escape().trim(),
            penulis : req.sanitize('penulis').escape().trim(),
            tahun : req.sanitize('tahun').escape().trim(),
            harga : req.sanitize('harga').escape().trim(),
        }
        // error starts here :(
        var o_id = new ObjectId(req.params.id)
        res.db.collection('buku').update({"_id" : o_id}, user, function(err, result){
            if (err) {
                req.flash('error', err)

                // render to user/edit
                res.render('user/edit', {
                    title : 'Edit Data',
                    id : req.params.id,
                    judul : req.body.judul,
                    penulis : req.body.penulis,
                    tahun : req.body.tahun,
                    harga : req.body.harga
                })
            } else {
                req.flash('Berhasil', 'Data berhasil diupdate')
                res.redirect('/tampil')
            }
        })
    }
    else { //Menampilkan error ke user
        var error_msg = ''
        error.forEach(function(error){
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        res.render('user/edit', {
            title : 'Edit Data',
            id : req.params.id,
            judul : req.body.judul,
            penulis : req.body.jurusan,
            tahun : req.body.tahun,
            harga : req.body.harga
        })
    }
})

// Delete User
app.delete('/delete/(:id)', function(req, res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('buku').remove({"_id" : o_id}, function(err, result){
        if (err) {
            req.flash('error', err)
            req.redirect('/users')
        } else {
            req.flash('berhasil', 'Data berhasil dihapus')
            // redirect ke halaman tampil data
            res.redirect('/tampil')
        }
    })
})

module.exports = app
