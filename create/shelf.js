$(function() {

  Parse.$ = jQuery;
    // Initialize Parse with your Parse application javascript keys
  Parse.initialize("NIJm5M6iY399T4yOD3dK8AoE2qGSiJz24BRkG9gT", "r0aSKgY4S5WccFrQPtAIE11EVAMxwHvCPC7r6KFh");

  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
  };

  var experienceACL = new Parse.ACL(Parse.User.current());

  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
      "submit form.signup-form": "signUp",
      "click #signup": "displaySignUp",
      "click #login": "displayLogIn"
    },

    el: ".page",
    
    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },

    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();
      
      Parse.User.logIn(username, password, {
        success: function(user) {  

          experienceList.render();
        },

        error: function(user, error) {
          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
          self.$(".login-form button").removeAttr("disabled");
        }
      });

      this.$(".login-form button").attr("disabled", "disabled");

      return false;
    },

    signUp: function(e) {

      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          experienceList.render();
        },

        error: function(user, error) {
          self.$(".signup-form .error").html(error.message).show();
          //self.$(".signup-form button").removeAttr("disabled");
        }
      });

      this.$(".signup-form button").attr("disabled", "disabled");

      return false;
    },

    displaySignUp: function(e){
      $("#signup").hide();
      $("#login").show();
      $(".login-form").addClass("closed");
      $(".signup-form").removeClass("closed");

      console.log("display signup form");

      return false;
    },

    displayLogIn: function(e){
      $("#signup").show();
      $("#login").hide();
      $(".signup-form").addClass("closed");
      $(".login-form").removeClass("closed");

      console.log("display signup form");

      return false;
    },

    render: function() {
      $(".navbar-header").hide();
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }

  });
  
  var Group = Parse.Object.extend("Group",{

    classname: "Group",

  });

  var Groups = Parse.Collection.extend({

    model: Group

  });

  var Experience = Parse.Object.extend("Experience",{

    className: "Experience", 
  });

  var Experiences = Parse.Collection.extend({

    model: Experience

  });

  var Challenge = Parse.Object.extend("Challenge",{

  className:"Challenge"

  });

  var Challenges = Parse.Collection.extend({

  model: Challenge

  });

  var Trophy = Parse.Object.extend("Trophy",{

    className: "Trophy"

  });

  var ExperienceList = Parse.View.extend({
    el: '.page',


    render:function () {
      $(".navbar-header").show();

      var that = this;
      var experiences = new Experiences();
      var query = new Parse.Query(Experience);
      var groups = new Groups();

      query.equalTo("user", Parse.User.current());
      experiences.query = query;
      experiences.fetch({
          success: function (experiences) {
            var query2 = new Parse.Query(Group);
            query2.equalTo("user", Parse.User.current());
            groups.query2 = query2;
            groups.fetch({
              success: function (groups){
                var template = _.template($('#experience-list-template').html(), {experiences: experiences.models, groups: groups.models});
                that.$el.html(template);
              }
            })

          }
      }); 
    },



  }); 

  var EditGroup = Parse.View.extend({
    el: '.page',

    events:{
      'submit .edit-group-form': 'saveGroup',
      'click .delete' : 'deleteGroup',
    },


    saveGroup: function(ev){
      console.log("saving group clicked");

      $(".has-error").removeClass("has-error");
    
      var valid = true;
      var groupDetails = $(ev.currentTarget).serializeObject();
      var group = new Group();

      var privacy;
          
          if($("#privacy").is(':checked')){
            privacy = true;
            console.log(privacy);
          }
      
          else{
            privacy = false;

          }


      $('input.required').each(function(){
        $('label[for="' + this.id + '"]').hide();
        var name = $(this).val();

        if(name != "") {

        }
        else{
           console.log("name is blank");
          valid = false;
          $(this).parent().addClass("has-error");

           $('label[for="' + this.id + '"]').show();
        }
      });

      if (valid){
        group.save(groupDetails,{
          success: function (group){
            experienceACL.setPublicReadAccess(true);
            group.setACL(experienceACL);
            group.set("private", privacy);
            group.save();
            router.navigate('edit-group/'+group.id, {trigger: true});

          },
          error: function(group, error){
            console.log('Failed to save group. Error: ' + error.message + error.code);
          }
        });
      }

    return false;



    },

          deleteGroup: function (ev) {
        this.group.destroy({
          success: function () {
            console.log('destroyed');
            router.navigate('', {trigger:true});
          }
        });
        return false;
      },



    render:function (options){
      $(".navbar-header").show();

      var that = this;

      if(options.groupId){
        console.log("getting group w id");
        that.group = new Group({id:options.groupId});
        var query = new Parse.Query(Group);
        query.equalTo("id", options.groupId);
        that.group.query = query;
        that.group.fetch({
          success: function (group){
            var experiences = new Experiences();
            var query = new Parse.Query(Experience);

            query.equalTo("group", group);
            experiences.query = query;

            experiences.fetch({
              success: function (experiences) {
                var template = _.template($('#edit-group-template').html(), {group: group, experiences: experiences.models});
                that.$el.html(template);

                $( "#privacy" ).attr('checked', group.get("private"));

              }
            })


          }
        })
      }
      else{
console.log("getting group no id");
        var template = _.template($('#edit-group-template').html(), {group: null, experiences: null});
        that.$el.html(template);

      }
      
      

    }
  });

  var EditExperience = Parse.View.extend({
    el: '.page',

    events: {
      'submit .edit-experience-form': 'saveExperience',
      'click .log-out': 'logOut',
      'click .delete' : 'deleteExperience',

    },

    saveExperience: function (ev){
      $(".has-error").removeClass("has-error");
      var valid = true;
      var experienceDetails = $(ev.currentTarget).serializeObject();
      var experience = new Experience();

      var selectedGroup= $('.group-select option:selected').val();

      //console.log("selectedGroup " + selectedGroup);
      

      var group = new Group();
      var query = new Parse.Query(Group);
      query.get(selectedGroup, {
        success: function (group){
          //console.log("the group is " + JSON.stringify(group));
          
          selectedGroup =  group;
        }
      });

      //console.log(experienceDetails);
      var point; 
      //var latlng;
      var address = $('#address').val();
      var geocoder = new google.maps.Geocoder();
      
      //console.log(address);

      geocoder.geocode( { 'address': address}, function(results, status) {
          var location = results[0].geometry.location;
          point = new Parse.GeoPoint({latitude: location.lat(), longitude: location.lng()});
          address = results[0].formatted_address;

        });


        console.log('the start date is ' + $('#start').val());

        var date = new Date($('#start').val());
        var expire = new Date($('#end').val());
        console.log("date object is " + date);




       // var date = new Date($('#start').val());
        //var expire = new Date($('#end').val());

          var privacy;
          
          if($("#privacy").is(':checked')){
            privacy = true;
           // console.log(privacy);
          }
      
          else{
            privacy = false;

          }





    $('input.required').each(function() {   
      $('label[for="' + this.id + '"]').hide();
        var name = $(this).val();

        if(name != "") {  
          //console.log("this field is valid")

        } 
        else{ 
            console.log("there is an error");         
            valid = false; 
            $(this).parent().addClass("has-error");
           
            $('label[for="' + this.id + '"]').show();

            
        }
    });

      if ($('#start').val() > $('#end').val()) {
          //console.log("start date is after end");
          $('#start').parent().addClass("has-error");
          $('#end').parent().addClass("has-error");
          $("label[for='start']").show();
          $("label[for='start']").text("The start date cannont be after the end date");
      }

      if(valid){

              experience.save(experienceDetails, {
        success: function (experience) {
          experience.set("address", address);
          $('#address').val(address);
          
          experience.set("location", point);
           experience.set("private", privacy);
          
          experience.set("group", selectedGroup);
          //experience.set("group", null);


          experience.set("start", date);
          experience.set("expire", expire);

          experience.set("user", Parse.User.current());
          experienceACL.setPublicReadAccess(true);
          experience.setACL(experienceACL);
          experience.save();
          console.log("id is" + experience.id);

          if(!experience.shortcode){
            console.log("shortcode is empty " + experience.id.substring(0,6));
            
            var shortcode = experience.id.substring(0,6);

            var query = new Parse.Query(Experience);
                query.equalTo("shortcode", shortcode);
                query.first({
                  success: function(object) {
                    if (object) {
                      console.log("This shortcode already exists.");
                    } else {
                            experience.set("shortcode", shortcode);
                            experience.save();
                    }
                  },
                  error: function(error) {
                    console.log("Could not validate uniqueness for this shortcode.");
                  }
                });


          }
          router.navigate('edit-experience/'+experience.id, {trigger: true});
          


        },
        error: function(experience, error) {
          alert('Failed with error code: ' + error.message + error.code );
        }
      });


      }

      else{
        console.log("you have not filled out all of the required fields")
      }


      return false;
    },

      deleteExperience: function (ev) {
        this.experience.destroy({
          success: function () {

            router.navigate('', {trigger:true});
          }
        });
        return false;
      },

    render: function(options) {
      $(".navbar-header").show();
        var that = this;
        var groups = new Groups();
        groups.fetch({
          success: function(groups){
            if(options.id){
              that.experience = new Experience({id: options.id});
              var query = new Parse.Query(Experience);
              query.equalTo("id", options.id);
              that.experience.query = query;
              that.experience.fetch({
                success: function (experience){
                  var challenges = new Challenges();
                  var query = new Parse.Query(Challenge);
                  query.equalTo("Experience", experience);
                  challenges.query = query;
                  challenges.fetch({
                    success: function (challenges){
                          var template = _.template($('#edit-experience-template').html(), {experience: experience, challenges: challenges.models, groups: groups.models});
                          that.$el.html(template);
                          $( "#privacy" ).attr('checked', experience.get("private"));

                    }                      
                  })
                }
              })
            }

            else {
              var template = _.template($('#edit-experience-template').html(), {experience: null, groups: groups.models});
              that.$el.html(template);
              $( "#privacy" ).attr('checked', experience.get("private"));
            }
          }
        })

    },

    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
    },
    
  });





  var EditChallenge = Parse.View.extend({
    el: '.page',

    events: {
      'submit .edit-challenge-form': 'saveChallenge',
      'click input:radio': 'editType',
      'click .delete': 'deleteChallenge'
    },

    editType: function(ev){
      
    $('input:radio').click(function(){
    $( "#multiple" ).hide();
    $( "#correct" ).hide();
    switch($(this).val()){

        case 'fill-in' :
          $( "#correct" ).show();
          $("#questionInput").attr("placeholder", "New Value");
          $("#questionInput").attr("placeholder", "Create a Fill in the Blank Question");
          console.log($(this).val());
          break;
        case 'photo' :
          //$( "#photo" ).show();
          console.log($(this).val());
          $("#questionInput").attr("placeholder", "Enter a Photo Prompt");
          break;
        case 'multiple' :
          $( "#correct" ).show();
          $( "#multiple" ).show();
           $("#questionInput").attr("placeholder", "Enter a multiple choice question");
          console.log($(this).val());
          break;
          }
    });
        


    },
    saveChallenge: function(ev){
      $(".has-error").removeClass("has-error");
      var valid = true;
      var challengDetails = $(ev.currentTarget).serializeObject();
      var challenge = new Challenge();
      console.log(challengDetails);
      console.log(challengDetails.Experience);
      var query = new Parse.Query(Experience);


        console.log('the start date is' + $('#start').val());




    $('input.required').each(function() {   
      $('label[for="' + this.id + '"]').hide();
        var name = $(this).val();

        if(name != "") {  
         

        } 
        else{ 
            console.log("there is an error");         
            valid = false; 
            $(this).parent().addClass("has-error");
        
            $('label[for="' + this.id + '"]').show();

            
        }
    });

      if(valid){

      
        query.get(challengDetails.Experience, {
          success: function(experience){
            delete challengDetails.Experience;
            //console.log(challengDetails);
            challenge.save(challengDetails, {
              success: function(challenge){
                 challenge.set("Experience", experience);
      
                 challenge.save();
                 router.navigate('edit-experience/'+experience.id, {trigger: true});
              },
              error: function(challenge, error) {
                console.log('failed with error: ' + error.message + error.code);
              }
            })
          }
        })

      }

      else{
        console.log("you have not filled out all of the required fields")
      }

      return false;
    },

      deleteChallenge: function (ev) {
        this.challenge.destroy({
          success: function () {
            console.log('destroyed');
            router.navigate('', {trigger:true});
          }
        });
        return false;
      },

    render: function(options){
      $(".navbar-header").show();
      var that = this;
      experience = new Experience({id: options.id});



          
       

      var query = new Parse.Query(Experience);
      query.equalTo("id", options.id);
      experience.query = query;
      experience.fetch({
        success: function (experience){

          if(options.challengeId){
          
            var challenge = new Challenge({id: options.challengeId});



            challenge.fetch({
              success: function (challenge) {
                console.log("trophy is " +challenge.get('trophy'));
                var trophy = challenge.get('trophy');
                if (trophy == null){
                  console.log("There is no trophy for this challenge");
                  var index = Math.floor(Math.random() * 20);
                  console.log("index is " + index);
                  var query = new Parse.Query(Trophy);
                  query.equalTo("index", index);

                  
                  query.first({
                    success: function (result){
                      console.log("trophy is " + result);
                      challenge.set("trophy", result);
                      challenge.save();
                      console.log("trophy is now" + challenge.get('trophy'));
                    },

                    error: function(error){
                      console.log("Error: " + error.code + " " + error.message);
                    }
                  })

                }
                trophy = challenge.get('trophy');
               
                trophy.fetch({
                  success: function(trophy){
                     console.log(trophy.get('image'));
                    var image = trophy.get('image').url();
                   
                    var template = _.template($('#edit-challenge-template').html(), {experience: experience, challenge:challenge, image:image});
                    that.$el.html(template);
                        var type = challenge.get('type');
                        console.log(type);
                        $('input:radio[name="type"]').filter('[value="' + type +'"]').attr('checked', true);
                        if(type!=multiple){
                        $( "#multiple" ).hide();
                      }
                      else{
                        $( "#multiple" ).show();
                      }
                  }
                })
                
               
              }
            })
          }

          else{
            var template = _.template($('#edit-challenge-template').html(), {experience: experience, challenge:null});
            that.$el.html(template);
          }

        } 
      })

      
      

    }

  });

  var Router = Parse.Router.extend({
    routes: {
      '': 'home',
      'new-group': 'editGroup',
      'edit-group/:groupId': 'editGroup',
      'new-experience': 'editExperience',
      'edit-experience/:id' : 'editExperience',
      ':id/new-challenge': 'editChallenge',
      ':id/edit-challenge/:challengeId': 'editChallenge',
    }
  });



  var logInView = new LogInView();
  var experienceList = new ExperienceList();
  var editGroup = new EditGroup();
  var editExperience = new EditExperience();
  var editChallenge = new EditChallenge();

  var router = new Router();

  router.on('route:home', function() {
    if (Parse.User.current()) {
      experienceList.render();
    } else {
      logInView.render();    
    }

    
  });

  router.on('route:editGroup', function(groupId){
    editGroup.render({groupId: groupId});
  });

  router.on('route:editExperience', function(id) {
    editExperience.render({id: id});
  });

  router.on('route:editChallenge', function(id, challengeId) {
    editChallenge.render({id: id, challengeId: challengeId});

  });





  Parse.history.start();


});





