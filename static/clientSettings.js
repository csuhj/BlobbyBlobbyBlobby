angular.module('app', []);

angular.module('app')
    .service('SettingsSvc', function($http) {
        this.load = function(username, token) {
            return $http.get('/api/settings?username='+username, {headers: {'x-auth': token}});
        };

        this.save = function(settings, token) {
            return $http.post('/api/settings', settings, {headers: {'x-auth': token}});
        }
    });

angular.module('app')
    .service('SessionsSvc', function($http) {
        this.getSessionToken = function(username, password) {
            return $http.post('/api/sessions', {username: username, password: password});
        };
    });

angular.module('app')
    .service('UsersSvc', function($http) {
        this.createUser = function(username, password) {
            return $http.post('/api/users', {username: username, password: password});
        };
    });

angular.module('app')
    .controller('SettingsCtrl', function($scope, $window, SettingsSvc, SessionsSvc, UsersSvc) {

        saveToken = function(token) {
            $window.localStorage['loginToken'] = JSON.stringify({token: token});
        }

        clearToken = function(token) {
            $window.localStorage['loginToken'] = null;
        }

        loadToken = function() {
            var tokenString = $window.localStorage['loginToken'];
            if (tokenString != undefined && tokenString != null) {
                var tokenObj = JSON.parse(tokenString);
                if (tokenObj != null) {
                    return tokenObj.token;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        parseJwt = function(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
        }

        autoLogin = function() {
            $scope.token = loadToken();
            if ($scope.token != undefined && $scope.token != null) {
                $scope.username = parseJwt($scope.token).username;
                $scope.loggedIn = true;
                $scope.loadSettings();
            }
        }

        $scope.login = function() {
            SessionsSvc.getSessionToken($scope.username, $scope.password)
                .success(function (token) {
                    $scope.token = token;
                    $scope.loggedIn = true;
                    saveToken(token);
                    $scope.loadSettings();
                });
        }

        $scope.createUser = function() {
            UsersSvc.createUser($scope.username, $scope.password)
                .success(function (user) {
                    $scope.login();
                });
        }

        $scope.logout = function() {
            $scope.token = null;
            $scope.loggedIn = false;
            clearToken();
        }

        $scope.loadSettings = function() {
            SettingsSvc.load($scope.username, $scope.token)
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
                    }, $scope.token);
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

        autoLogin();
    });