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
Session.setDefault('costtoplay',10);
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
        //the dcount has not changed, because there has been no room for 
        //donations. 
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
        myArrM = Behaviour.find({round:thisRound,group:myPlayerGroup}).fetch();
        myArrN = Behaviour.find({round:thisRound}).fetch();

        //Game Level
        mynPlayers = myArrN.length; 
        if(mynPlayers===0){mynPlayers=1;};
        if(mynPlayers===1){
            //console.log("this is the first player in the game");
            myeRankN = 1;
            myeNtied=0;
            myeQuartileN=1;
            myeMinN=Behaviour.findOne(myPlayerID).eLevel;
            myeMaxN=myeMinN;
        }
        else{
            myeGTn = Behaviour.find({round:thisRound, eLevel:{$gt:myPlayerScore}}).fetch();
            length_myeGTn = myeGTn.length;
            //console.log("There are this many Greater Thans : "  + length_myeGTn);
            myeGTEn = Behaviour.find({round:thisRound, eLevel:{$gte:myPlayerScore}}).fetch();
            length_myeGTEn = myeGTEn.length-1; //excluding this player
            //console.log("There are this many Greater Than and Equal Tos : "  + length_myeGTEn);
            myeRankN = length_myeGTn +1;
            if(length_myeGTn===length_myeGTEn){
                myeNtied = 0;
            }else{
                myeNtied=length_myeGTEn-length_myeGTn;
            }

            tempID= Behaviour.findOne({round:thisRound},{sort:{eLevel:-1}}); //sorts on descending
            myeMaxN=Behaviour.findOne(tempID).eLevel;
            tempID=Behaviour.findOne({round:thisRound},{sort:{eLevel:1}}); //sorts on ascending
            myeMinN=Behaviour.findOne(tempID).eLevel;

            if(mynPlayers<4){
              myeQuartileN=myeRankN;}
            else{
                if(myeRankN<mynPlayers/4){
                    myeQuartileN=1;
                }else if(myeRankN<mynPlayers/2){
                    myeQuartileN=2;
                }else if(myeRankN<3*mynPlayers/4){
                    myeQuartileN=3;
                }else{
                    myeQuartileN=4;
                }
            }
        }
        //Group Level                
        mymPlayers = myArrM.length;
        if(mymPlayers===1){
            //console.log("this is the first player in the group");
            myeRankM = 1;
            myeMtied=0;
            myeQuartileM=1;
            myeMinM=Behaviour.find(myPlayerID).eLevel;
            myeMaxM=myeMinM;
        }else{
            myeGTm = Behaviour.find({round:thisRound, group:myPlayerGroup, eLevel:{$gt:myPlayerScore}}).fetch();
            length_myeGTm = myeGTm.length;
            //console.log("There are this many Greater Thans : "  + length_myeGTm);
            myeGTEm = Behaviour.find({round:thisRound, group:myPlayerGroup, eLevel:{$gte:myPlayerScore}}).fetch();
            length_myeGTEm = myeGTEm.length-1;//exclude this player
            //console.log("There are this many Greater Than and Equal Tos : "  + length_myeGTEm);
            myeRankM = length_myeGTm +1;
            if(length_myeGTm===length_myeGTEm){
                myeMtied = 0;
            }else{
                myeMtied=length_myeGTEm-length_myeGTm;
            }
            tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{eLevel:-1}});
            myeMaxM= Behaviour.findOne(tempID).eLevel;
            tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{eLevel:1}});
            myeMinM=Behaviour.findOne(tempID).eLevel;

            if(mymPlayers<4){
                myeQuartileM = myeRankM;
            }else{
            if(myeRankM<mymPlayers/4){
                myeQuartileM=1;
            }else if(myeRankM<mymPlayers/2){
                myeQuartileM=2;
            }else if(myeRankM<3*mymPlayers/4){
                myeQuartileM=3;
            }else{
                myeQuartileM=4;
            }
            }
        }
        
        //Donations
    //Game Level
       if(mynPlayers===1){
        //console.log("this is the first player in the game");
        mydRankN = 1;
        mydNtied=0;
        mydQuartileN=1;
        mydMinN=Behaviour.findOne(myPlayerID).dCount;
        mydMaxN=mydMinN;
    }
    else{
        mydGTn = Behaviour.find({round:thisRound, dCount:{$gt:myPlayerCount}}).fetch();
        length_mydGTn = mydGTn.length;
        //console.log("There are this many Greater Than donations : "  + length_mydGTn);
        mydGTEn = Behaviour.find({round:thisRound, dCount:{$gte:myPlayerCount}}).fetch();
        length_mydGTEn = mydGTEn.length-1; //excluding this player
        //console.log("There are this many Greater Than and Equal To Donations : "  + length_mydGTEn);
        mydRankN = length_mydGTn +1;
        if(length_mydGTn===length_mydGTEn){
            mydNtied = 0;
        }else{
            mydNtied=length_mydGTEn-length_mydGTn;
        }

        tempID= Behaviour.findOne({round:thisRound},{sort:{dCount:-1}}); //sorts on descending
        mydMaxN=Behaviour.findOne(tempID).dCount;
        tempID=Behaviour.findOne({round:thisRound},{sort:{dCount:1}}); //sorts on ascending
        mydMinN=Behaviour.findOne(tempID).dCount;

        if(mynPlayers<4){
          mydQuartileN=mydRankN;}
        else{
            if(mydRankN<mynPlayers/4){
                mydQuartileN=1;
            }else if(mydRankN<mynPlayers/2){
                mydQuartileN=2;
            }else if(mydRankN<3*mynPlayers/4){
                mydQuartileN=3;
            }else{
                mydQuartileN=4;
            }
        }
    }
    

    //Group Level                
    mymPlayers = myArrM.length;
    if(mymPlayers===1){
        //console.log("this is the first player in the group");
        mydRankM = 1;
        mydMtied=0;
        mydQuartileM=1;
        mydMinM=Behaviour.find(myPlayerID).dCount;
        mydMaxM=mydMinM;
    }else{
        mydGTm = Behaviour.find({round:thisRound, group:myPlayerGroup, dCount:{$gt:myPlayerCount}}).fetch();
        length_mydGTm = mydGTm.length;
        //console.log("There are this many Greater Thans : "  + length_mydGTm);
        mydGTEm = Behaviour.find({round:thisRound, group:myPlayerGroup, dCount:{$gte:myPlayerCount}}).fetch();
        length_mydGTEm = mydGTEm.length-1;//exclude this player
        //console.log("There are this many Greater Than and Equal Tos : "  + length_mydGTEm);
        mydRankM = length_mydGTm +1;
        if(length_mydGTm===length_mydGTEm){
            mydMtied = 0;
        }else{
            mydMtied=length_mydGTEm-length_mydGTm;
        }
        tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{dCount:-1}});
        mydMaxM= Behaviour.findOne(tempID).dCount;
        tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{dCount:1}});
        mydMinM=Behaviour.findOne(tempID).dCount;

        if(mymPlayers<4){
            mydQuartileM = mydRankM;
        }else{
        if(mydRankM<mymPlayers/4){
            mydQuartileM=1;
        }else if(mydRankM<mymPlayers/2){
            mydQuartileM=2;
        }else if(mydRankM<3*mymPlayers/4){
            mydQuartileM=3;
        }else{
            mydQuartileM=4;
        }
        }
    }
            
        notupdated=true;
        if(notupdated){
        Behaviour.update(myPlayerID,{$set:{
        eRankN:myeRankN,
        eRankNtied:myeNtied,
        eRankM:myeRankM,
        eRankMtied:myeMtied,
        eQuartileN:myeQuartileN,
        eQuartileM:myeQuartileM,
        eMinM:myeMinM,
        eMaxM:myeMaxM,
        eMinN:myeMinN,
        eMaxN:myeMaxN,
        dRankN:mydRankN,
        dRankNtied:mydNtied,
        dRankM:mydRankM,
        dRankMtied:mydMtied,
        dQuartileN:mydQuartileN,
        dQuartileM:mydQuartileM,
        dMinM:mydMinM,
        dMaxM:mydMaxM,
        dMinN:mydMinN,
        dMaxN:mydMaxN,
        nPlayers:mynPlayers,
        mPlayers:mymPlayers,
        dCount: myPlayerCount
        

        }});
        notupdated=false;
        }


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
                //console.log("we are now inserting the player");
                //console.log("the score we are inserting is " + thisScore);
                //console.log("the round is " + thisRound);   
                Behaviour.insert({
                    playerID: thisID,
                    group: thisGroup,
                    round: thisRound,
                    eLevel: thisScore,
                    dCount:0,
                    nPlayers:0,
                    mPlayers:0,
                    eRankN:0,
                    eRankNtied:0,
                    eRankM:0,
                    eRankMtied:0,
                    eQuartileN:0,
                    eQuartileM:0,
                    dRankN:0,
                    dRankNtied:0,
                    dRankM:0,
                    dRankMtied:0,
                    dQuartileN:0,
                    dQuartileM:0,
                    eMinM:0,
                    eMaxM:0,
                    eMinN:0,
                    eMaxN:0,
                    dMinM:0,
                    dMaxM:0,
                    dMinN:0,
                    dMaxN:0,
                    failed: false,
                    received: false
                    });
                clearInterval(timeinterval);
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
                }else{
                    startScore = Behaviour.findOne({playerID:thisID,round:thisRound-1}).eLevel;
                    //console.log("the start score is " + startScore + "the round is " + thisRound);
                }
                newScore = newScore + Session.get('attempts');
                Session.set('attempts',0);
                thisScore = startScore + newScore;
                Session.set('currentScore',thisScore);
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
        //console.log("incorrect attempt, try again!");}
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
      eRank = Behaviour.findOne(thisPlayerID).eRankN;
      return eRank;
    },
    
    sRank:function(){
      thisID=Session.get('myID');
      thisRound = Session.get('roundcount');
      thisPlayerID = Behaviour.findOne({playerID:thisID,round:thisRound})._id;
      sRank = Behaviour.findOne(thisPlayerID).dRankN;
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
        tempD = Behaviour.findOne(myPlayerID).dCount;
        tempD = tempD+1;
        //console.log("the total donations are" + tempD);
        tempE = Behaviour.findOne(myPlayerID).eLevel;
        //console.log("the pre earnings are" + tempE);
        dam = Session.get('costofdonation');
        tempE = tempE - dam;
        //console.log("the post earnings are" + tempE);
        Behaviour.update(myPlayerID,{$set:{dCount:tempD,eLevel:tempE}});
        theseDonations = Session.get('myDonations');
        Session.set("myDonations",theseDonations+1);
//

    //here we must calculate all the ranks etc for the donations.
    //also the ranks for earnings have to be updated.

    //Donations:
    //remember to aggregate all donations
    myPlayerCount = Behaviour.findOne(myPlayerID).dCount;
    
    //Earnings:
    myPlayerScore=Behaviour.findOne(myPlayerID).eLevel;

    myPlayerGroup = Behaviour.findOne(myPlayerID).group;
    
    //calculate all the behavioural fields and update
    myArrM = Behaviour.find({round:thisRound,group:myPlayerGroup}).fetch();
    myArrN = Behaviour.find({round:thisRound}).fetch();
    
    //Earnings
    //Game Level
    mynPlayers = myArrN.length; if(mynPlayers===0){mynPlayers=1;};
    if(mynPlayers===1){
        //console.log("this is the first player in the game");
        myeRankN = 1;
        myeNtied=0;
        myeQuartileN=1;
        myeMinN=Behaviour.findOne(myPlayerID).eLevel;
        myeMaxN=myeMinN;
    }
    else{
        myeGTn = Behaviour.find({round:thisRound, eLevel:{$gt:myPlayerScore}}).fetch();
        length_myeGTn = myeGTn.length;
        //console.log("There are this many Greater Thans : "  + length_myeGTn);
        myeGTEn = Behaviour.find({round:thisRound, eLevel:{$gte:myPlayerScore}}).fetch();
        length_myeGTEn = myeGTEn.length-1; //excluding this player
        //console.log("There are this many Greater Than and Equal Tos : "  + length_myeGTEn);
        myeRankN = length_myeGTn +1;
        if(length_myeGTn===length_myeGTEn){
            myeNtied = 0;
        }else{
            myeNtied=length_myeGTEn-length_myeGTn;
        }

        tempID= Behaviour.findOne({round:thisRound},{sort:{eLevel:-1}}); //sorts on descending
        myeMaxN=Behaviour.findOne(tempID).eLevel;
        tempID=Behaviour.findOne({round:thisRound},{sort:{eLevel:1}}); //sorts on ascending
        myeMinN=Behaviour.findOne(tempID).eLevel;

        if(mynPlayers<4){
          myeQuartileN=myeRankN;}
        else{
            if(myeRankN<mynPlayers/4){
                myeQuartileN=1;
            }else if(myeRankN<mynPlayers/2){
                myeQuartileN=2;
            }else if(myeRankN<3*mynPlayers/4){
                myeQuartileN=3;
            }else{
                myeQuartileN=4;
            }
        }
    }
    
    //Group Level                
    mymPlayers = myArrM.length;
    if(mymPlayers===1){
        //console.log("this is the first player in the group");
        myeRankM = 1;
        myeMtied=0;
        myeQuartileM=1;
        myeMinM=Behaviour.find(myPlayerID).eLevel;
        myeMaxM=myeMinM;
    }else{
        myeGTm = Behaviour.find({round:thisRound, group:myPlayerGroup, eLevel:{$gt:myPlayerScore}}).fetch();
        length_myeGTm = myeGTm.length;
        //console.log("There are this many Greater Thans : "  + length_myeGTm);
        myeGTEm = Behaviour.find({round:thisRound, group:myPlayerGroup, eLevel:{$gte:myPlayerScore}}).fetch();
        length_myeGTEm = myeGTEm.length-1;//exclude this player
        //console.log("There are this many Greater Than and Equal Tos : "  + length_myeGTEm);
        myeRankM = length_myeGTm +1;
        if(length_myeGTm===length_myeGTEm){
            myeMtied = 0;
        }else{
            myeMtied=length_myeGTEm-length_myeGTm;
        }
        tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{eLevel:-1}});
        myeMaxM= Behaviour.findOne(tempID).eLevel;
        tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{eLevel:1}});
        myeMinM=Behaviour.findOne(tempID).eLevel;

        if(mymPlayers<4){
            myeQuartileM = myeRankM;
        }else{
        if(myeRankM<mymPlayers/4){
            myeQuartileM=1;
        }else if(myeRankM<mymPlayers/2){
            myeQuartileM=2;
        }else if(myeRankM<3*mymPlayers/4){
            myeQuartileM=3;
        }else{
            myeQuartileM=4;
        }
        }
    }
    
    //Donations
    //Game Level
       if(mynPlayers===1){
        //console.log("this is the first player in the game");
        mydRankN = 1;
        mydNtied=0;
        mydQuartileN=1;
        mydMinN=Behaviour.findOne(myPlayerID).dCount;
        mydMaxN=mydMinN;
    }
    else{
        mydGTn = Behaviour.find({round:thisRound, dCount:{$gt:myPlayerCount}}).fetch();
        length_mydGTn = mydGTn.length;
        //console.log("There are this many Greater Than donations : "  + length_mydGTn);
        mydGTEn = Behaviour.find({round:thisRound, dCount:{$gte:myPlayerCount}}).fetch();
        length_mydGTEn = mydGTEn.length-1; //excluding this player
        //console.log("There are this many Greater Than and Equal To Donations : "  + length_mydGTEn);
        mydRankN = length_mydGTn +1;
        if(length_mydGTn===length_mydGTEn){
            mydNtied = 0;
        }else{
            mydNtied=length_mydGTEn-length_mydGTn;
        }

        tempID= Behaviour.findOne({round:thisRound},{sort:{dCount:-1}}); //sorts on descending
        mydMaxN=Behaviour.findOne(tempID).dCount;
        tempID=Behaviour.findOne({round:thisRound},{sort:{dCount:1}}); //sorts on ascending
        mydMinN=Behaviour.findOne(tempID).dCount;

        if(mynPlayers<4){
          mydQuartileN=mydRankN;}
        else{
            if(mydRankN<mynPlayers/4){
                mydQuartileN=1;
            }else if(mydRankN<mynPlayers/2){
                mydQuartileN=2;
            }else if(mydRankN<3*mynPlayers/4){
                mydQuartileN=3;
            }else{
                mydQuartileN=4;
            }
        }
    }
    

    //Group Level                
    mymPlayers = myArrM.length;
    if(mymPlayers===1){
        //console.log("this is the first player in the group");
        mydRankM = 1;
        mydMtied=0;
        mydQuartileM=1;
        mydMinM=Behaviour.find(myPlayerID).dCount;
        mydMaxM=mydMinM;
    }else{
        mydGTm = Behaviour.find({round:thisRound, group:myPlayerGroup, dCount:{$gt:myPlayerCount}}).fetch();
        length_mydGTm = mydGTm.length;
        //console.log("There are this many Greater Thans : "  + length_mydGTm);
        mydGTEm = Behaviour.find({round:thisRound, group:myPlayerGroup, dCount:{$gte:myPlayerCount}}).fetch();
        length_mydGTEm = mydGTEm.length-1;//exclude this player
        //console.log("There are this many Greater Than and Equal Tos : "  + length_mydGTEm);
        mydRankM = length_mydGTm +1;
        if(length_mydGTm===length_mydGTEm){
            mydMtied = 0;
        }else{
            mydMtied=length_mydGTEm-length_mydGTm;
        }
        tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{dCount:-1}});
        mydMaxM= Behaviour.findOne(tempID).dCount;
        tempID = Behaviour.findOne({round:thisRound,group:myPlayerGroup},{sort:{dCount:1}});
        mydMinM=Behaviour.findOne(tempID).dCount;

        if(mymPlayers<4){
            mydQuartileM = mydRankM;
        }else{
        if(mydRankM<mymPlayers/4){
            mydQuartileM=1;
        }else if(mydRankM<mymPlayers/2){
            mydQuartileM=2;
        }else if(mydRankM<3*mymPlayers/4){
            mydQuartileM=3;
        }else{
            mydQuartileM=4;
        }
        }
    }
            
        notupdated=true;
        if(notupdated){
        Behaviour.update(myPlayerID,{$set:{
        eRankN:myeRankN,
        eRankNtied:myeNtied,
        eRankM:myeRankM,
        eRankMtied:myeMtied,
        eQuartileN:myeQuartileN,
        eQuartileM:myeQuartileM,
        eMinM:myeMinM,
        eMaxM:myeMaxM,
        eMinN:myeMinN,
        eMaxN:myeMaxN,
        dRankN:mydRankN,
        dRankNtied:mydNtied,
        dRankM:mydRankM,
        dRankMtied:mydMtied,
        dQuartileN:mydQuartileN,
        dQuartileM:mydQuartileM,
        dMinM:mydMinM,
        dMaxM:mydMaxM,
        dMinN:mydMinN,
        dMaxN:mydMaxN
        }});
        notupdated=false;}
    


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
        
        //decrease earnings by cost
        thisID = Session.get('myID');
        myPlayerID = Behaviour.findOne({playerID:thisID,round:thisRound})._id;
        tempE = Behaviour.findOne(myPlayerID).eLevel;
        cost = Session.get('costtoplay');
        tempE = tempE-cost;
        Behaviour.update(myPlayerID,{$set:{eLevel:tempE}});
        
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
     thisRound = Session.get('roundcount')
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
