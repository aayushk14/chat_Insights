
Router.route('/', function (){
    this.render('analytics');

});
Router.route('/analytics',function(){
  this.render('conversation_analytics');
  // this.layout('loginLayout');
});


