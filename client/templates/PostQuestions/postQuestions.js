Session.setDefault('howwealthy',0);
Session.setDefault('howinteresting',0);
Session.setDefault('displayChoice',0);

Template.post.events({
    
    'click #done':function(event){
        event.preventDefault(); 
        howinteresting = document.getElementById('interesting').value;
        Session.set('howinteresting',howinteresting);
        console.log("howinteresting" + howinteresting);
        howwealthy= document.getElementById('familywealth').value;
        Session.set('howwealthy',howwealthy);
        console.log(howwealthy);
        thisID = Session.get('myID');
        myPlayers.update(thisID, {$set: {interesting: howinteresting, wealth: howwealthy}});
        Session.set('displaychoice',true);
    }
});
Template.post.helpers({
    howinteresting:function(){
        Session.get('howinteresting');
    },
    howwealthy:function(){
        Session.get('howwealthy');
        
    },
    displaychoice:function(){
        Session.get('displaychoice');
    }
         
});
 
 Template.readmore.events({
 
    'submit form':function(event){
        event.preventDefault();  
        email=event.target.Email.value;
        thisID = Session.get('myID');
        console.log("email: " + email);
        myPlayers.update(thisID, {$set: {email: email}});
    }
    
});