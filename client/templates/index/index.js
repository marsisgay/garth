//Booleans
Session.setDefault('gamestarted',false);
Session.setDefault('signedin',false);
Session.setDefault('TreatmentGroup',false); //false indicates control gourp

Session.setDefault('roundinplay', false);
Session.setDefault('firstdecisiontime',false);
Session.setDefault('startroundtwo',false);

//Values used throughout the game
Session.setDefault('roundlength',30);

//server side variables!!
Session.setDefault('lastUsedGroup',2); //2 = Treatment. on ther server. 

Session.setDefault('Egroup',false);
Session.setDefault('ESgroup',false);
Session.setDefault('Sgroup',false);
Session.set('Cgroup',false);

Session.set('displayE',false);
Session.set('displayS',false);

Template.index.helpers({
    
    treatmentTest: function(){
      return Session.get('TreatmentGroup');  
    },
    countdown: function () {
        return Session.get('countdown');
    },
    gamestarted: function () {
        return Session.get('gamestarted');
    },
    roundinplay: function () {
        return Session.get('roundinplay');
    },
    readinstructions: function () {
        return Session.get('readinstructions');
    },
    firstdecisiontime: function(){
        return Session.get('firstdecisiontime');
    },
    startroundtwo:function(){
      return Session.get('startroundtwo');  
    },
    findPlayerID: function(){
        var currentplayerID = PlayersList.findOne()._id;
        console.log("This is the ID:");
        console.log(currentPlayerID);
        return currentplayerID;
    },
    signedin: function(){
        return Session.get('signedin');
    }

});   
Template.index.events({
    'click #start':function(){
        started=true;
        console.log("enteredbutton");
        Session.set('roundinplay', started);
        Session.set('gamestarted', started);
        Session.set('inround',true);
        Session.set('roundcount',1);
        Router.go('main');
    }
});

Template.instructions.helpers({    
    instructionstest : function(){
//        console.log("first test");
        Session.set('readinstructions',true);
//        var temp  = session.get('readinstructions');
//        console.log("second test");
//        console.log("readinstructions"+temp);
    }
});
Template.instructions.events({
    
});

Template.signup.events({
    'submit form':function(event){
        event.preventDefault();  
        console.log("default prevented");

        //Get particulars
        var myage = event.target.age.value;
        console.log(myage);
        var mygender = event.target.gender.value;
        console.log(mygender);
        var myfield = event.target.field.value;
        console.log(myfield);
        var mylevel = event.target.Level.value;
        
        var temp = myPlayers.find().fetch();
        nPlayers = temp.length; myKey=nPlayers+1;
        if(nPlayers===0){nPlayers=1;lastUsedGroup=4;}
        else{lastUsedGroup = myPlayers.findOne({key:myKey-1}).group;}

        //Determine whether treatment or control
        
        if(lastUsedGroup === 1){
            thisGroup = 2;
            Session.set('ESgroup',true);
            Session.set('Egroup',false);
            Session.set('Sgroup',false);
            Session.set('Cgroup',false);
        }else if(lastUsedGroup ===2){
            thisGroup = 3;
            Session.set('Sgroup',true);
            Session.set('Egroup',false);
            Session.set('ESgroup',true);
            Session.set('Cgroup',false);
        }else if(lastUsedGroup===3){
            thisGroup =4;
            Session.set('Sgroup',false);
            Session.set('Egroup',true);
            Session.set('ESgroup',false);
            Session.set('Cgroup',false);
        }else{
            thisGroup=1;
            Session.set('Sgroup',false);
            Session.set('Egroup',false);
            Session.set('ESgroup',false);
            Session.set('Cgroup',true);
        }
        Eind = Session.get('Egroup');
        Sind = Session.get('Sgroup');
        ESind = Session.get('ESgroup');
        
        if(Eind || ESind){
            Session.set('displayE',true);
        }
        if(Sind || ESind){
            Session.set('displayS',true);
        }
        
        
        console.log('groups');
        console.log("The previously assigned group is " + lastUsedGroup);
        console.log("The assigned group is " + thisGroup);
        console.log("The number of players so far is: " + myKey);

        // load the values into the DB
        myPlayers.insert(
            {
            age: myage,
            gender: mygender,
            field: myfield,
            level: mylevel,
            group: thisGroup,
            key: myKey,
            interesting: 0,
            wealth:0,
            email: 0,
            createdAt: new Date()});
        //find this players ID and use it throughout the rest of the session;
        thisID = myPlayers.findOne({key: myKey})._id;
        Session.set('myID',thisID);
        Session.set('myGroup',thisGroup);
        Session.set('signedin',true);
        Router.go('index');
    }
});