app.config(function($stateProvider) {

  $stateProvider.state('team', {
    url: '/team',
    templateUrl: 'js/app/states/team/team.html',
    controller: 'teamController',
    resolve: {
      pages: function(UserFactory) {
        return UserFactory.getPages()
      },
      teams: function(UserFactory) {
        return UserFactory.getTeams()
      },
      allusers: function(UserFactory) {
        return UserFactory.getAllUsers();
      },
      users: function(TeamFactory) {
        return TeamFactory.getTeamMembers();
      }
    }
  });

});

app.controller('teamController', function($scope, BackgroundFactory, $state, $rootScope, pages, teams, allusers, TeamFactory, users, StateFactory) {
  StateFactory.state.name = 'team';
  $scope.alerts = [];
  $scope.pages = pages;
  $scope.teams = teams;
  $scope.users = users;
  $scope.alerts = [];
  $scope.pages = pages;
  // $scope.teamId = $stateParams.id;
  $scope.team = users;
  $scope.everySingleUser = allusers;
  $scope.curTeam;
  $scope.teamPages = pages.filter(function(page) {
    return (page.team._id === $scope.teamId);
  });

  $scope.createNewTeam = function(teamObject) {

    if (teamObject.name === "personal") {
      $scope.alerts.push({
        msg: "personal is a reserved team name, please choose another",
        type: 'danger'
      });
    } else if (teamObject.name === "All Teams") {
      $scope.alerts.push({
        msg: "All Teams is a reserved team name, please choose another",
        type: 'danger'
      });
    } else {
      TeamFactory.createNewTeam(teamObject.name).then(function(team) {
        chrome.runtime.sendMessage({
          title: "change teams",
          team: team
        }, function() {});
        $scope.team.push(team);
      });
    }
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.addNewTeamMember = function(teamId, userObj, teamObj) {
    var userToPush = _.cloneDeep(userObj);
    var email;
    var teamName;
    if (userObj) email = userObj.email;
    else email = null;
    if (teamObj) teamName = teamObj.name;
    else teamName = $scope.team.name;
    var isDuplicate = false;
    $scope.team.forEach(function(team) {
      if (team._id === teamId) $scope.curTeam = team;
      console.log(team)
    })
    $scope.curTeam.users.forEach(function(user) {
      if (user.email === email) {
        $scope.alerts.push({
          msg: "User is already part of the team",
          type: 'danger'
        });
        isDuplicate = true;
      }
    });
    if (isDuplicate) return;
    TeamFactory.updateTeam(teamId, {
      name: teamName,
      userEmail: email
    }).then(function(returnedTeam) {
      chrome.runtime.sendMessage({
        title: "change teams",
        team: returnedTeam
      }, function() {});
      console.log("what is userToPush", userToPush);
      $scope.team.forEach(function(team) {
          if (team._id !== teamId) return;
          if (userToPush) team.users.push(userToPush);
          team.name = returnedTeam.name;
        })
        //$scope.team.users.push(userToPush);
      if ($scope.team.name !== returnedTeam.name) {
        $scope.team.name = returnedTeam.name;
      }
    }).then($scope.checktoggle());
  };

  $scope.deleteMember = function(teamId, userId) {
    console.log('deleteing member drews log');
    TeamFactory.deleteTeamMember(teamId, userId).then(function(team) {
        chrome.runtime.sendMessage({
          title: "change teams",
          team: team,
          userId: userId
        }, function() {});
        console.log("this is the team", team);
      })
      .then(function() {
        $scope.team.forEach(function(team) {
          if (team._id !== teamId) return;
          team.users = team.users.filter(function(user) {
            return user._id !== userId;
          });
        });
      });
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.checktoggle = function() {
    if ($scope.alerts[0] === undefined) {
      $scope.toggleEdit = !$scope.toggleEdit;
    }
  };

});
