if( process.env.NODE_ENV == "production"){
    module.exports = {mongoURI:"mongodb+srv://gabriel:bibikan123@blogapp-prod.ldw1b.mongodb.net/Blogapp-prod?retryWrites=true&w=majority"}
}else{
    module.exports ={mongoURI:'mongodb://localhost/blogapp'}
}