var ActiveDirectory = Npm.require('activedirectory');
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  
  
  'getAnalyticalData': function(type){
    
    try{
      
      var url = Meteor.settings.chatAnalytics_URL + type;
      //var res = HTTP.get(url);
      //var res = HTTP.post(url, {data:{"key" : "intent"}, headers:{'Content-Type': 'application/json'}});
      
      var res = HTTP.get(url);
      
      console.log("Url HIT : ",url);
      console.log("REsponse : ",res);
      //console.log("query " + JSON.stringify(query));
      //console.log(JSON.parse(res_content));
      // remove non-printable and other non-valid JSON chars
      result ={};
      if(res.statusCode==200){
        result = JSON.parse(res.content);
        //console.log("result", result);
      }
    }
    catch(err)
    {
      console.log("Error during getReplys:")
      console.log(err.message);
      result={"outputtext":"error"}
    }
    console.log(result);
    return result;
  },
  
    'getChartData': function(type, dateRange){
    
    try{
      
      var url = Meteor.settings.chatAnalytics_URL + type + "/" + dateRange;
      console.log("url", url)
      
      var res = HTTP.get(url);
      
      
      //console.log("query " + JSON.stringify(query));
      //console.log(JSON.parse(res_content));
      // remove non-printable and other non-valid JSON chars
      result ={};
      if(res.statusCode==200){
        result = JSON.parse(res.content);
        //console.log("result", result);
      }
    }
    catch(err)
    {
      console.log("Error during getReplys for chart:")
      console.log(err.message);
      result={"text":"No DATA"}
    }
    return result;
  },
  
  'getTableData': function(intent_filter,action_filter,count){
    try{
        console.log("Top Transaction count : ", count);
        console.log("Intent Filter  : ", intent_filter);
        console.log("Action filter : ", action_filter);
        
         var url = Meteor.settings.chatAnalytics_URL + "top_transactions/" +intent_filter+"/"+action_filter+"/"+ count;
         var res = HTTP.get(url); 
          result ={};
        if(res.statusCode==200){
          result = JSON.parse(res.content);
          
        } 
      }
      catch(err)
      {
        console.log("Error during getReply:")
        console.log(err.message);
        result={"text":"No DATA"}
      }
      return result;
    },

//    'getIntentData': function(count,intent_filter,action_filter){
//    try{
//         console.log("count", count);
//         console.log("filter",filter)
//         var url = Meteor.settings.chatAnalytics_URL + "top_transactions/" + filter +"/"+count;
//         var res = HTTP.get(url); 
//          result ={};
//        if(res.statusCode==200){
//          result = JSON.parse(res.content);
//          
//        } 
//      }
//      catch(err)
//      {
//        console.log("Error during getReply:")
//        console.log(err.message);
//        result={"text":"No DATA"}
//      }
//      return result;
//    },
    
    'getConversationData': function(url){
      try{
        var res = HTTP.get(url);
        result ={};
        if(res.statusCode==200){
          result = JSON.parse(res.content);
          console.log("result", result);
        }
      }
      catch(err)
      {
        console.log("Error during getReply:")
        console.log(err.message);
        result={"text":"No DATA"}
      }
      return result;
    }
    
  });
