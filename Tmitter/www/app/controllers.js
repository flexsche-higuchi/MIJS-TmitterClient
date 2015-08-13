(function () {
    "use strict";

    angular.module("myapp.controllers", [])

    .controller("appCtrl", ["$scope", function ($scope) {
    }])

    //homeCtrl provides the logic for the home screen
    .controller("homeCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        $scope.count = 20;

        $scope.refresh = function () {
            //refresh binding
            $scope.updateTimeline();
            $scope.$broadcast("scroll.refreshComplete");
        };
        $scope.loadMore = function () {
            $scope.count = $scope.count + 5;
            $scope.updateTimeline();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        $scope.updateTimeline = function () {
            myappService.http({
                method: 'GET',
                url: myappService.url + "/posts?limit=" + $scope.count
            }).success(function (data, status, headers, config) {
                $scope.items = data;
                console.log(status);
                console.log(data);
            }).error(function (data, status, headers, config) {
                console.log(status);
            });
        }
        $scope.updateTimeline();
    }])

    //errorCtrl managed the display of error messages bubbled up from other controllers, directives, myappService
    .controller("errorCtrl", ["$scope", "myappService", function ($scope, myappService) {
        //public properties that define the error message and if an error is present
        $scope.error = "";
        $scope.activeError = false;

        //function to dismiss an active error
        $scope.dismissError = function () {
            $scope.activeError = false;
        };

        //broadcast event to catch an error and display it in the error section
        $scope.$on("error", function (evt, val) {
            //set the error message and mark activeError to true
            $scope.error = val;
            $scope.activeError = true;

            //stop any waiting indicators (including scroll refreshes)
            myappService.wait(false);
            $scope.$broadcast("scroll.refreshComplete");

            //manually apply given the way this might bubble up async
            $scope.$apply();
        });
    }])
    .controller("loginCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        $scope.model = {
            user_name: myappService.user_name,
            password: myappService.password,
            password_confirm: ""
        };
        $scope.login = true;

        $scope.addUser = function () {
            if ($scope.login) {
                myappService.http({
                    method: 'POST',
                    url: myappService.url + "/login",
                    data: {
                        user_name: $scope.model.user_name,
                        password: $scope.model.password,
                    }
                }).success(function (data, status, headers, config) {
                    myappService.user_name = $scope.model.user_name;
                    myappService.password = $scope.model.password;
                    myappService.session_id = data.session_id;
                    $state.go("app.home");
                }).error(function (data, status, headers, config) {
                    $scope.login = false;
                    console.log(status);
                });
            }
            else {
                myappService.http({
                    method: 'POST',
                    url: myappService.url + "/users",
                    data: {
                        user_name: $scope.model.user_name,
                        password: $scope.model.password,
                        password_confirm: $scope.model.password_confirm
                    }
                }).success(function (data, status, headers, config) {
                    $scope.login = true;
                    $scope.addUser();
                }).error(function (data, status, headers, config) {
                    console.log(status);
                });
            }
            return true;
        }
    }])
    .controller("postCtrl", ["$scope", "$state", "myappService", function ($scope, $state, myappService) {
        $scope.model = {
            photoFile: "",
            url: "",
            message: "",
        }

        $scope.doPost = function () {
            if (false/*$scope.model.photoFile != ""*/) {
                var formData = new FormData();
                formData.append("file", $scope.model.photoFile);
                myappService.http({
                    method: 'POST',
                    url: myappService.url + "/images",
                    data: formData,
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).success(function (data, status, headers, config) {
                    $scope.model.url = data;
                    console.log(data);
                    console.log(status);
                    $scope._doPost();
                }).error(function (data, status, headers, config) {
                    console.log(status);
                });
            }
            else
                $scope._doPost();
        }

        $scope._doPost = function () {
            myappService.http({
                method: 'POST',
                url: myappService.url + "/posts",
                data: {
                    session_id: myappService.session_id,
                    message: $scope.model.message,
                    url: ""     // $scope.model.url
                }
            }).success(function (data, status, headers, config) {
                $scope.clear();
                $state.go("app.home");
                console.log(data);
                console.log(status);
            }).error(function (data, status, headers, config) {
                console.log(status);
            });
        }

        $scope.clear = function () {
            $scope.model.photoFile = "";
            $scope.model.url = "";
            $scope.model.message = "";
        }

        $scope.photo = function () {
            navigator.camera.getPicture(function (data) {
                $scope.model.photoFile = data;
            },
            function (message) { },
            {
                quality: 50,
                destinationType: 1  // FILE_URL 0      // DATA_URL
            });
        }
    }]);
})();