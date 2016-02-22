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
                    $scope.updateRules();
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

        $scope.updateRules = function() {
            $scope.disableUpdateRules();
            try {
                $scope.errorMessages = "";
                $window.gameFrame = eval("("+$scope.gameCode+")");
            } catch (e) {
                $scope.errorMessages = e.message;
            }
        }

        $scope.disableUpdateRules = function() {
            $scope.updateRulesDisabled = true;
        }

        $scope.enableUpdateRules = function() {
            $scope.updateRulesDisabled = false;
        }
    });