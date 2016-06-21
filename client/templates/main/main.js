Session.setDefault('inround',false);
Session.setDefault('betweenround',false);
Session.setDefault('endrounds',false);
Session.setDefault('countdown', 30);
Session.setDefault('roundlength',30);
Session.setDefault('currentScore',0);

Session.setDefault('attempts',0);
Session.setDefault('minimumScore',15);
Session.setDefault('checked',false);
Session.setDefault('predonationcheck',true);
Session.setDefault('donationavailable',false);
Session.setDefault('myDonations',0);
Session.setDefault('costtoplay',12);
Session.setDefault('costofdonation',2);

Session.setDefault('currentwordPos',1);

Template.main.helpers({


    inround:function(){

        a1=Session.get('inround');
        a2=Session.get('betweenround');
        b3 = Session.get('roundcount');
        if(b3>5){a3=false;}else{a3=true;}
        if(a1===true && a2===false && a3===true){
            return true;
        }else{
            return false;}
        
        
    }, 
    betweenround:function(){
        a1=Session.get('inround');
        a2=Session.get('betweenround');
        if(a1===false && a2===true){
            Session.set('predonationcheck',true);
            return true;
        }else{
            return false;}
    },
    endrounds:function(){
        b3 = Session.get('roundcount');
        if(b3>5){
        return true;
        }else{
        return false;}
    },
    passed: function(){
      return Session.get('passed');
    },
    checkup: function(){
        
        //this function checks whether you should proceed to the
        //the donate or the receive template
        //because of persistence, we need to map the elevel etc 
        //here, so that it doesn't change state when we have donated.
        //get the earnings, and update the elevel. 
        //the dcount has not changed, because there has been no room/time for donations. 
        //this means we have to apply the dcount from the previous round. 
        //however, we need to recalculate the ranks for both the d and the e values.
        
        //we should have created an entry into "Behaviour" when the countdown hit 0.
        //this means that there should be an ID available for this round and this ID.
        
        //console.log("we are now in the check up function");
        
        thisRound = Session.get('roundcount');
        thisID = Session.get('myID');
        myPlayerID = Behaviour.findOne({playerID:thisID,round:thisRound})._id;
        myPlayerGroup = Behaviour.findOne(myPlayerID).group;
        myPlayerScore = Behaviour.findOne(myPlayerID).eLevel;
        myPlayerCount = 0;
        if(thisRound>1){
            myPlayerIDprevious = Behaviour.findOne({playerID:thisID,round:thisRound-1})._id;
            myPlayerCount= Behaviour.findOne(myPlayerIDprevious).dCount;
            Behaviour.update(myPlayerID,{$set:{dCount:myPlayerCount}});
        }
        
    //calculate all the behavioural fields and update
    //Game Level
    myArrN = Behaviour.find({round:thisRound}).fetch();
    mynPlayers = myArrN.length; if(mynPlayers===0){mynPlayers=1;};
    Behaviour.update(myPlayerID,{$set:{nPlayers:mynPlayers}});
    if(mynPlayers===1){
        //console.log("this is the first player in the game");
        eRankEnd=1;
        dRankEnd=1;
        eRankStart=1;
        dRankStart=1;
        myeNtied=0;
        mydNtied=0;
    }else{

//earnings
        myeGTn = Behaviour.find({round:thisRound, eLevel:{$gt:myPlayerScore}}).fetch();
        length_myeGTn = myeGTn.length;
        //console.log("There are this many Greater Thans : "  + length_myeGTn);
        myeGTEn = Behaviour.find({round:thisRound, eLevel:{$gte:myPlayerScore}}).fetch();
        length_myeGTEn = myeGTEn.length-1; //excluding this player
        //console.log("There are this many Greater Than and Equal Tos : "  + length_myeGTEn);
        eRankStart = length_myeGTn +1;
        if(length_myeGTn===length_myeGTEn){
            myeNtied = 0;
        }else{
            myeNtied=length_myeGTEn-length_myeGTn;
        }
        
        
        mydGTn = Behaviour.find({round:thisRound, dCount:{$gt:myPlayerCount}}).fetch();
        length_mydGTn = mydGTn.length;
        //console.log("There are this many Greater Than donations : "  + length_mydGTn);
        mydGTEn = Behaviour.find({round:thisRound, dCount:{$gte:myPlayerCount}}).fetch();
        length_mydGTEn = mydGTEn.length-1; //excluding this player
        //console.log("There are this many Greater Than and Equal To Donations : "  + length_mydGTEn);
        dRankStart = length_mydGTn +1;
        if(length_mydGTn===length_mydGTEn){
            mydNtied = 0;
        }else{
            mydNtied=length_mydGTEn-length_mydGTn;
        }


        Behaviour.update(myPlayerID,{$set:{
        eRankStart:eRankStart,
        eRankEnd:eRankStart,
        eRankNtied:myeNtied,
        dRankStart:dRankStart,
        dRankEnd:dRankStart,
        dRankNtied:mydNtied
        }});

    }

    //Group Level 
    myArrM = Behaviour.find({round:thisRound,group:myPlayerGroup}).fetch();
    mymPlayers = myArrM.length; if(mymPlayers===0){mymPlayers=1;};
    Behaviour.update(myPlayerID,{$set:{mPlayers:mymPlayers}});
//    if(mymPlayers===1){
//        //console.log("this is the first player in the group");
//        myeRankM = 1;
//        myeMtied=0;
//        myeMinM=Behaviour.find(myPlayerID).eLevel;
//        myeMaxM=myeMinM;
//        mydRankM = 1;
//        mydMtied=0;
//        mydMinM=Behaviour.find(myPlayerID).dCount;
//        mydMaxM=mydMinM;
//    }else{

//    }
    
        
        
        

        theBar = Session.get("minimumScore");
        if(myPlayerScore<theBar){
            Behaviour.update(myPlayerID,{$set:{failed:true}});
            Session.set('passed',false);
            //console.log("checking if you passed, you didn't");
        }else{
            //console.log("checking if you passed, you did");
            Session.set('passed',true);
        }
        
        Session.set('checked',true);},
    
    
    checked: function(){
        return Session.get('checked');
    }
    
});
Template.main.events({
    
});

Template.round.helpers({
    countdown: function () {
        return Session.get('countdown');
    },
    myScore: function(){
      return Session.get('currentScore');  
    },
    roundcount: function(){
      return Session.get('roundcount');  
    },
    getWord: function(){
        wordPos = Session.get('currentwordPos');
        words = WordBase.find().fetch();
        myWord = words[wordPos].word;
        return myWord;
    },
    timer: function(){
        countd=Session.get('roundlength');
        Session.set('countdown', countd);
        Session.set('attempts',0);
        newScore = 0;
        thisRound = Session.get('roundcount');
        thisID = Session.get('myID');
        thisGroup = myPlayers.findOne(thisID).group;
        
 
        
        var timeinterval = setInterval(function(){
            if(countd<1){
                thisScore = Session.get('currentScore');
                console.log("we are now inserting the player");
                console.log("the score we are inserting is " + thisScore);
                console.log("the round is " + thisRound);   
                Behaviour.insert({
                    playerID: thisID,
                    group: thisGroup,
                    round: thisRound,                   

                    dCount:0, //cumulative
                    currentdCount:0, //current

                    eStart:startScore, // =eRound - costtoplay(if)
                    eLevel:thisScore, // =estart + eround

                    //Game Level
                    nPlayers:0,
                    eRankStart:0,
                    eRankEnd:0,
                    eRankNtied:0,
                    
                    dRankStart:0,
                    dRankEnd:0,
                    dRankNtied:0,
                    
                    
                    //Group Level
                    mPlayers:0,
  

                    failed: false,
                    received: false
                    });
                    
                clearInterval(timeinterval);
                Session.set('attempts',0);
                Session.set('roundfinished',true);
                Session.set('gamestarted',false);
                Session.set('inround',false);
                Session.set('betweenround',true);
            }else{
                countd--;
                Session.set('countdown', countd);
                //console.log(thisID);               
               if(thisRound===1){
                    startScore=0;
                    theydidreceive = true;
                }else{
                    cost = Session.get('costtoplay');
                    startScore = Behaviour.findOne({playerID:thisID,round:thisRound-1}).eLevel;
                    console.log("the start score is " + startScore + "& the round is " + thisRound);
                    mylastID = Behaviour.findOne({playerID:thisID,round:thisRound-1})._id;
                    theydidreceive = Behaviour.findOne(mylastID).received;
                    console.log("they did receive? " + theydidreceive);
                }

                if(theydidreceive){
                    thisScore = startScore + Session.get('attempts');
                }else{
                    startScore = startScore -12;
                    thisScore = startScore + Session.get('attempts');
                    
                }

                Session.set('currentScore',thisScore);
                console.log("the score is " + thisScore);
                
                

                
                
            }
        },1000); 
        }
    
});
Template.round.events({  
'submit form': function(e){
    e.preventDefault();
    wordPos = Session.get('currentwordPos');
    words = WordBase.find().fetch();
    myWord = words[wordPos].word;
    var myText =e.target.myAttempt.value;
    //here myText will be tested against a word/phrase in a database.
    if(myText === myWord){
        //console.log("correct!");
        var myoldScore = Session.get('attempts');
        mynewScore = myoldScore+1;
        Session.set('attempts',mynewScore);
        //console.log("wordpos 1");
        //console.log(wordPos);
        wordPos = wordPos+1;
        //console.log("wordpos 2");
        //console.log(wordPos);
        Session.set('currentwordPos',wordPos);
        //console.log("currentwordPos");
        //console.log(Session.get('currentwordPos')); 
        e.target.myAttempt.value = '';
    }else{
        //console.log("incorrect attempt, try again!");
    }
       e.target.myAttempt.value = '';
    //        //  clear form
    }
    
});

Template.donate.helpers({

    displayEarnings:function(){
        return Session.get('displayE');
    },
    displaySocial:function(){
        return Session.get('displayS');
    },
    numPlayers:function(){
      thisID=Session.get('myID');
      thisRound = Session.get('roundcount');
      thisPlayerID=Behaviour.findOne({playerID:thisID,round:thisRound})._id;
      numPlayers = Behaviour.findOne(thisPlayerID).nPlayers;
      return numPlayers;
    },
    
    eRank:function(){
      thisID=Session.get('myID');
      thisRound = Session.get('roundcount');
      thisPlayerID=Behaviour.findOne({playerID:thisID,round:thisRound})._id;
      eRank = Behaviour.findOne(thisPlayerID).eRankEnd;
      return eRank;
    },
    
    sRank:function(){
      thisID=Session.get('myID');
      thisRound = Session.get('roundcount');
      thisPlayerID = Behaviour.findOne({playerID:thisID,round:thisRound})._id;
      sRank = Behaviour.findOne(thisPlayerID).dRankEnd;
      if(sRank===0){
          sRank= Behaviour.findOne(thisPlayerID).nPlayers;
      }
      return sRank;
    },
    
    tiedECount:function(){
      thisID=Session.get('myID');
      thisRound = Session.get('roundcount');
      thisPlayerID=Behaviour.findOne({playerID:thisID,round:thisRound})._id;
      numTiedE = Behaviour.findOne(thisPlayerID).eRankNtied;
      return numTiedE;
    },
    tiedSCount:function(){
      thisID=Session.get('myID');
      thisRound = Session.get('roundcount');
      thisPlayerID=Behaviour.findOne({playerID:thisID,round:thisRound})._id;
      numTiedS = Behaviour.findOne(thisPlayerID).dRankNtied;
      return numTiedS;
    },
    
    theseDonations: function(){
        return Session.get('myDonations');
    },
    
    lastround: function(){
      temp=Session.get('roundcount');
      if(temp===5){
          return true;
      }else{
          return false;
      }
    },
    
    myEarnings: function(){
        //console.log("this is my earnings")
        thisRound = Session.get('roundcount');
        //console.log("the round is " + thisRound);
        thisID = Session.get('myID');
        //console.log("the id is " + thisID);
        myPlayerID = Behaviour.findOne({playerID:thisID,round:thisRound})._id;
        //console.log("the player is " + myPlayerID);
        tempE = Behaviour.findOne(myPlayerID).eLevel;
        //console.log("the earnings are " + tempE);
        return tempE;
    },
      
    rankDisplay: function(){
        //this function much check which group and return the right indicator such that the relevant ranks are displayed.
    },
    stillWealthy: function(){
        thisID = Session.get('myID');
        thisRound = Session.get('roundcount');
        
        myPlayerID = Behaviour.findOne({playerID: thisID,round:thisRound})._id;
        tempE = Behaviour.findOne(myPlayerID).eLevel;
        
        if(thisRound<5){
            thebar = Session.get('costtoplay')+Session.get('costofdonation')-1;
            if(tempE>thebar){
                //console.log("enough to continue");
                return true;
            }else{
                //console.log("not enough to continue");
                return false;}
        }else{
            thebar = Session.get('costofdonation')-1;
            if(tempE>thebar){
                return true;
            }else{
                return false;
            }
        }
        }    
   
});
Template.donate.events({
    'click #donate':function(){
    //console.log("you want to donate");
    thisID = Session.get('myID');
    thisRound = Session.get('roundcount');
    myPlayerID = Behaviour.findOne({playerID: thisID,round:thisRound})._id;
    
    tempD = Behaviour.findOne(myPlayerID).currentdCount;
    tempD = tempD+1;

    
    myPlayerScore = Behaviour.findOne(myPlayerID).eLevel;
//    console.log("the pre earnings are" + tempE);
    dam = Session.get('costofdonation');
    myPlayerScore = myPlayerScore - dam;
    
    if(thisRound>1){
        mypreviousID = Behaviour.findOne({playerID: thisID,round:thisRound-1})._id;
        myPlayerCount=Behaviour.findOne(mypreviousID).dCount + tempD;
    }else{
        myPlayerCount=tempD;
    }
    //console.log("the post earnings are" + tempE);
    Behaviour.update(myPlayerID,{$set:{currentdCount:tempD,dCount:myPlayerCount,eLevel:myPlayerScore}});
    Session.set('myDonations',tempD);

    myPlayerGroup = Behaviour.findOne(myPlayerID).group; //group
    
    //calculate all the behavioural fields and update
    
    //Game Level
    myArrN = Behaviour.find({round:thisRound}).fetch();
    mynPlayers = myArrN.length; if(mynPlayers===0){mynPlayers=1;};
    Behaviour.update(myPlayerID,{$set:{nPlayers:mynPlayers}});
    if(mynPlayers===1){
        //console.log("this is the first player in the game");
        eRankStart = 1;
        eRankEnd = 1;
        eRankNtied=0;
//        myeMinN=Behaviour.findOne(myPlayerID).eLevel;
//        myeMaxN=myeMinN;
        dRankStart=1;
        dRankEnd=1;
        dRankNtied=0;
//        mydMinN=Behaviour.findOne(myPlayerID).dCount;
//        mydMaxN=mydMinN;
    }else{

//        
        myeGTn = Behaviour.find({round:thisRound, eLevel:{$gt:myPlayerScore}}).fetch();
        length_myeGTn = myeGTn.length;
        //console.log("There are this many Greater Thans : "  + length_myeGTn);
        myeGTEn = Behaviour.find({round:thisRound, eLevel:{$gte:myPlayerScore}}).fetch();
        length_myeGTEn = myeGTEn.length-1; //excluding this player
        //console.log("There are this many Greater Than and Equal Tos : "  + length_myeGTEn);
        eRankEnd = length_myeGTn +1;
        if(length_myeGTn===length_myeGTEn){
            eRankNtied = 0;
        }else{
            eRankNtied=length_myeGTEn-length_myeGTn;
        }
        
        
        mydGTn = Behaviour.find({round:thisRound, dCount:{$gt:myPlayerCount}}).fetch();
        length_mydGTn = mydGTn.length;
        //console.log("There are this many Greater Than donations : "  + length_mydGTn);
        mydGTEn = Behaviour.find({round:thisRound, dCount:{$gte:myPlayerCount}}).fetch();
        length_mydGTEn = mydGTEn.length-1; //excluding this player
        //console.log("There are this many Greater Than and Equal To Donations : "  + length_mydGTEn);
        dRankEnd = length_mydGTn +1;
        if(length_mydGTn===length_mydGTEn){
            dRankNtied = 0;
        }else{
            dRankNtied=length_mydGTEn-length_mydGTn;
        }


        Behaviour.update(myPlayerID,{$set:{
        eRankEnd:eRankEnd,
        eRankNtied:eRankNtied,
        dRankEnd:dRankEnd,
        dRankNtied:dRankNtied
        }});
        
    }

    //Group Level 
    myArrM = Behaviour.find({round:thisRound,group:myPlayerGroup}).fetch();
    mymPlayers = myArrM.length; if(mymPlayers===0){mymPlayers=1;};
    Behaviour.update(myPlayerID,{$set:{mPlayers:mymPlayers}});
    
        //load into donations array: playerID, timestamp,available =true
        Donations.insert({
           from: thisID,
           fromGroup: Behaviour.findOne(myPlayerID).group,
           fromRound: thisRound,
           toGroup: 0,
           toRound:0,
           available: true,
           timeStamp: new Date()       
        });
    },
    
    'click #nextround':function(){
        //update all values
        //roundcount ? countd?
        //console.log("you clicked a button to go the next round");
        thisRound = Session.get('roundcount');
//        if(thisRound<5){
//            thisID = Session.get('myID');
//            myPlayerID = Behaviour.findOne({playerID:thisID,round:thisRound})._id;
//            //decrease earnings by cost
//            tempE = Behaviour.findOne(myPlayerID).eLevel;
//            cost = Session.get('costtoplay');
//            tempE = tempE-cost;
//            Behaviour.update(myPlayerID,{$set:{eLevel:tempE}});
//        }
        

        thisRound = thisRound +1;
        Session.set('roundcount',thisRound);
        Session.set("myDonations",0);
        Session.set('checked',false);
        Session.set('betweenround',false);
        Session.set('inround',true);        
        
    }

});

Template.receive.helpers({
    rec_lastround: function(){
      temp=Session.get('roundcount');
      if(temp===5){
          //console.log("this is the last round");
          return true;
      }else{
          return false;
      }
    },
    predonationcheck: function(){
        return Session.get('predonationcheck');
    },
    donationavailable: function(){
        return Session.get('donationavailable');
    }    
});
Template.receive.events({
    'click #checkfordonations': function(){
     //console.log("checking for donations");
     Session.set('predonationcheck',false);
     thisID = Session.get('myID');
     thisRound = Session.get('roundcount');
     myPlayerID = Behaviour.findOne({playerID:thisID,round:thisRound})._id;
     someDonations = Donations.find({available: true, from: {$ne: thisID}}).fetch();
     availableDonations = someDonations.length;
        if(availableDonations>0){
        Session.set('donationavailable',true);    
        //update Donations array
        thisRound = Session.get('roundcount');
        thisGroup = Behaviour.findOne(myPlayerID).group;
        thisDonationID = Donations.findOne({available: true, from: {$ne: thisID}})._id;
        Donations.update(thisDonationID,{$set:{ 
        toGroup: thisGroup,
        toRound: thisRound,
        available: false
       }});
       Behaviour.update(myPlayerID,{$set:{received:true}});
       //allow player to go to next round
        
     }else{
         Session.set('donationavailable',false);
         //send player to the end of the game.
        }
    },
    
    'click #nextroundR':function(){
        //update all values
        
        //console.log("you clicked a button to go the next round");
        temp = Session.get('roundcount');
        temp = temp+1;
        Session.set('roundcount',temp);
        Session.set('betweenround',false);
        Session.set('inround',true);
        Session.set('myDonations',0);
        Session.set('checked',false);
        
    }
    
});
