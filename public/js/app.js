var nodeApp = angular.module('nodeApp', []);

nodeApp.controller('AppController', ['$scope', '$http',
function($scope, $http) {
  $scope.email = '';
  $scope.show = false;

  $scope.add = function() {
    if ($scope.email === '') {
      $scope.show = true;
      $scope.message = 'Type you\'re email!';
    }
    else {
      $http.post('/add', {
        email: $scope.email
      }).
      success(function(data, status, headers, config) {
        $scope.show = true;
        $scope.message = data.message;
        if (data.status) {
          $scope.email = '';
        }
      }).
      error(function(data, status, headers, config) {
        $scope.show = true;
        $scope.message = 'Error on request';
      });
    }
  };
}]);
