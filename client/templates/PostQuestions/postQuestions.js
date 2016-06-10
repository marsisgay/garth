Session.setDefault('howinteresting',"4");
Session.setDefault('howwealthy',"50");

Template.post.events({
    'click':function(){
        howinteresting2 = document.getElementById('interesting').value;
        howwealthy2= document.getElementById('familywealth').value;

        Session.set('howinteresting',howinteresting2);
        Session.set('howwealthy',howwealthy2);
        
        thisID = Session.get('myID');
        myPlayers.update(thisID, {$set: {interesting: howinteresting2, wealth: howwealthy2}});

        return Session.get('howinteresting');
    }
    
});
Template.post.helpers({
    fhowinteresting: function(){
        return Session.get('howinteresting');
    },
    fhowwealthy:function(){
        return Session.get('howwealthy');
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