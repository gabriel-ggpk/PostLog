const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin')
const path = require('path');
const  mongoose  = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Post')
const Post = mongoose.model('Post')
require('./models/Category')
const Category = mongoose.model('categories')
const user = require('./routes/user')
const passport = require("passport")
require("./config/auth")(passport)
const db = require('./config/db')

//CONFIG
    //Sessao
        app.use(session({
            secret: 'bibian123',
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //MIDDLEWARE
        app.use((req,res,next)=>{
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user||null
            next()
        })    
    //bodyParser
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
    //handleBars
        app.engine('handlebars',handlebars({defaultLayout:'main'}))
        app.set('view engine', 'handlebars');
    //Mongoose
    mongoose.Promise = global.Promise
        mongoose.connect(db.mongoURI,
        {useNewUrlParser: true , 
        useUnifiedTopology: true
        
        } ).then(()=> {
            console.log('Connected to mongodb')
        }).catch(err =>{
            console.log(err)
        })
        

    //Public
        app.use(express.static(path.join(__dirname, 'public')));
//ROTAS
app.get('/', (req,res)=>{
    Post.find().populate('category').lean().sort({date: "desc"}).then((posts)=> {
        res.render("index", {posts: posts})

    }).catch(err => {
        console.log(err)
        req.flash('error_msg',"erro interno")
        res.redirect('/404')
    })
    
})
app.get('/404',(req,res)=>{
    res.send("error 404")
})
app.get('/post/read/:slug', (req,res)=>{
    Post.findOne({slug: req.params.slug}).lean().then((post)=>{
        if(post){
            res.render("posts/index",{post:post})

        }
        else{
            req.flash('error_msg','Erro, postagem nao existe')
            res.redirect('/')
        }
    }).catch(err =>{
        console.log(err)
        req.flash('error_msg',"internal error")
        res.redirect('/')
    })
})
app.get('/categories',(req,res)=>{
    Category.find().lean().then((category)=>{
        res.render("categories/index",{category:category})
    }).catch(err =>{
        req.flash('error_msg',"falha interna")
        res.redirect('/')
    })
})
app.get('/categories/:slug', (req,res)=>{
    Category.findOne({slug: req.params.slug}).lean().then((category)=>{
        if(category){
            console.log(category._id)
            Post.find({category: category._id}).lean().then((posts)=>{
                console.log(posts)
                res.render("categories/posts",{posts:posts , category:category})
            }).catch(err =>{
                req.flash('error_msg','Erro, postagem nao existe')
                res.redirect('/')
            })
        }
        else{
            req.flash('error_msg','Error')
            res.redirect('/categories')
        }
    }).catch(err =>{
        req.flash('error_msg',"internal error")
        res.redirect('/')
    })
})
app.use('/adm',admin)

app.use('/user',user)
//CONFIG
const PORT = process.env.PORT || 8000;
app.listen(PORT,() => {
    console.log("servidor ok")
})
