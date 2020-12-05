const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Category");
const Category = mongoose.model("categories");
require("../models/Post");
const Post = mongoose.model("Post");
const {isAdm} = require("../helpers/isAdm")



router.get("/",isAdm, (req, res) => {
  res.render("admin/index");
});

router.get("/posts",isAdm, (req, res) => {
  res.send("pagina de posts");
});

router.get("/categories",isAdm, (req, res) => {
  Category.find()
    .sort({ date: "desc" })
    .lean()
    .then((category) => {
      res.render("admin/categories", { category: category });
    })
    .catch((err) => {
      req.flash("error_msg", "houve um erro");
      res.redirect("/adm");
    });
});
router.post("/categories/new",isAdm, (req, res) => {
  var errors = [];
  if (
    !req.body.name ||
    req.body.name == null ||
    typeof req.body.name == undefined
  ) {
    errors.push({ text: "Nome invalido" });
  }
  if (
    !req.body.slug ||
    req.body.slug == null ||
    typeof req.body.slug == undefined
  ) {
    errors.push({ text: "slug invalido" });
  }
  if (errors.length > 0) {
    res.render("admin/addcategories", { errors: errors });
  } else {
    const newCategory = {
      name: req.body.name,
      slug: req.body.slug,
    };
    new Category(newCategory)
      .save()
      .then(() => {
        req.flash("success_msg", "cateoria salva");
        res.redirect("/adm/categories");
      })
      .catch((err) => {
        req.flash("error_msg", "erro ao salvar categoria");
      });
  }
});

router.get("/categories/edit/:id",isAdm, (req, res) => {
  Category.findOne({ _id: req.params.id })
    .lean()
    .then((category) => {
      res.render("admin/editcategories", { category: category });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao editar");
      res.redirect("/adm/categories");
    });

  router.post("/categories/edit/edit",isAdm, (req, res) => {
    Category.findOne({ _id: req.body.id })
      .then((category) => {
        category.name = req.body.name;
        category.slug = req.body.slug;
        category.save().then(() => {
          req.flash("success_msg", "cateoria Salva");
          res.redirect("/adm/categories");
        });
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao editar");
        res.redirect("/adm/categories");
      });
  });
});

router.post("/categories/delete", isAdm,(req, res) => {
  Category.remove({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "cateoria deletada");
      res.redirect("/adm/categories");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao deletar");
      res.redirect("/adm/categories");
    });
});
router.get("/categories/add",isAdm, (req, res) => {
  res.render("admin/addcategories");
});

router.get("/post",isAdm, (req, res) => {
  Post.find().populate("category").lean().sort({date:"desc"}).then((posts) => {
    res.render("admin/post", { posts: posts });
  }).catch((err) => {
    req.flash("error_msg", "Erro ao listar postagens")
    res.redirect("/adm")
  })
});
router.get("/post/add",isAdm, (req, res) => {
  Category.find()
    .lean()
    .then((category) => {
      res.render("admin/postsadd", { category: category });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao adicionar post");
      res.redirect("/adm");
    });
});
router.post("/post/new",isAdm, (req, res) => {
  var errors = [];
  if (req.body.category == "0") {
    errors.push({ text: "Category invalid" });
  }
  if (errors.length > 0) {
    res.render("admin/postsadd", { errors: errors });
  } else {
    const newPost = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category,
    };
    new Post(newPost)
      .save()
      .then(() => {
        req.flash("success_msg", "Post successfully created");
        res.redirect("/adm/post");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao adicionar Post");
        res.redirect("/adm/post");
      });
  }
});


router.get("/post/edit/:id",isAdm, (req, res) => {

  Post.findOne({_id: req.params.id}).lean().then((post) => {
    
    Category.find().lean().then((category) => {

      res.render("admin/editpost",{ category: category,post:post});

    }).catch((err) => {

      req.flash("error_msg","Erro ao listar categorias")
      res.redirect("/adm/post");
      
    })
  }).catch((err) => {
    req.flash("error_msg","Erro ao carregar formulario")
    res.redirect("/adm/post");
  })
  
})
router.post("/post/edit",isAdm, (req, res) => {
 
  Post.findOne({_id: req.body.id}).then((post) => {
    
    post.title = req.body.title
    post.slug = req.body.slug
    post.description = req.body.description
    post.content = req.body.content
    post.category = req.body.category
    post.save().then(() => {
      req.flash("success_msg", "postagem salva")
      res.redirect("/adm/post");
    }).catch((err) => {
      
      req.flash("error_msg", "Erro ao salvar post")
      res.redirect("/adm/post");
    })

  }).catch((err) => {
    console.log(err)
    req.flash("error_msg", "Erro ao salvar edicao")
    res.redirect("/adm/post");
  })

})

router.get("/post/delete/:id",isAdm, (req, res) => {
  Post.remove({_id: req.params.id}).then(() => {
    req.flash("success_msg", "postagem Deletada")
    res.redirect("/adm/post")
  }).catch((err) => {
    console.log(err)
    req.flash("error_msg", "Erro ao deletar postagem!")
    res.redirect("/adm/post")
  })
})

module.exports = router;
