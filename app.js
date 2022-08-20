const express = require("express");
const bodyParser = require("body-parser");
const date= require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// urlencoded reads data from web pages

app.set('view engine', 'ejs');
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemSchema = {
    name: String
};

const Item = mongoose.model("Item",itemSchema);

const Item1 = new Item({
    name: "Hit the + button to add a new item"
})

const Item2 = new Item({
    name: "<<- click here to remove item"
})

const defaultItems = [Item1, Item2];

const listSchema= {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List",listSchema);

let day  =  "Current";//date.getDate();
app.get("/", function (req, res) { 
    
    
    Item.find({},function(err, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully executed save operation");
                }
            });
            res.redirect("/");
        }else{
            res.render("list",{
                listTitle: day,
                newListItems: foundItems
            }); 
        }
        
    });
    
      // parenthesis needed for running function only
   
});

app.get("/:customListName", function (req, res) { 
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err,foundList) {
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list",{
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
        }  
        }      
    });
});


app.post("/", function (req, res) { //request,response
    const itemName= req.body.newItem;
        const listName = req.body.list;
        const item= new Item({
            name: itemName
        });
    if(listName=== "Current"){
        item.save();
        res.redirect("/");
    }
    else{

        List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });

    }

});

app.post("/delete", function(req, res){
    const a = req.body.checkbox; //itemID
    const listName = req.body.listName;
    if(listName==="Current"){
        Item.findByIdAndRemove(a, function(err){
            if(!err){
                console.log("succesfully deleted.");
                res.redirect("/");
            }
            console.log(err);
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id: a}}},function(err,foundItem) {
            if(!err){
                res.redirect("/"+listName);
            }            
        });
    }
   
});




app.listen( process.env.PORT || 3000, function () {
    console.log("opened on port 3000");
});