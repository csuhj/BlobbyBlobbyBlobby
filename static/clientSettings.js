angular.module('app', []);

angular.module('app')
    .service('SettingsSvc', function($http) {
        this.load = function(username) {
            return $http.get('/api/settings?username='+username);
        };

        this.save = function(settings) {
            return $http.post('/api/settings', settings);
        }
    });

angular.module('app')
    .controller('SettingsCtrl', function($scope, $window, SettingsSvc) {

        $scope.loadSettings = function() {
            SettingsSvc.load($scope.username)
                .success(function (settings) {
                    $scope.gameCode = settings[0].gameCode;
                    $scope.updateGameCode();
                });
        }

        $scope.saveSettings = function() {
            if ($scope.gameCode) {
                SettingsSvc.save({
                        username: $scope.username,
                        gameCode: $scope.gameCode
                    });
            }
        };

        $scope.updateGameCode = function() {
            $scope.disableUpdateGameCode();
            try {
                $scope.errorMessages = "";
                eval($scope.gameCode);
            } catch (e) {
                $scope.errorMessages = e.message;
            }
        }

        $scope.disableUpdateGameCode = function() {
            $scope.updateGameCodeDisabled = true;
        }

        $scope.enableUpdateGameCode = function() {
            $scope.updateGameCodeDisabled = false;
        }
    });