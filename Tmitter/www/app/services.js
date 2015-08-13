(function () {
    "use strict";

    angular.module("myapp.services", []).factory("myappService", ["$rootScope", "$http", function ($rootScope, $http) {
        var myappService = {};

        //starts and stops the application waiting indicator
        myappService.wait = function (show) {
            if (show)
                $(".spinner").show();
            else
                $(".spinner").hide();
        };

        myappService.http = $http;
        myappService.session_id = "";
        myappService.user_name = "";
        myappService.password = "";

        myappService.url = "http://192.168.10.84:8000";

        return myappService;
    }]);
})();