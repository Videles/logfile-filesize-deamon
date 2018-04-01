$( document ).ready(function() {

    /**
     * Input file field
     * @var {object} input
     */
    var input;

    /**
     * Put the watcher function in a click event
     * @var {string} \The ID of the button
     */
    document.getElementById('watch').onclick = function() {
        startWatching();
    };

    /**
     * Will read the file without posting it to the server
     * @var {object} \Input file field
     */
    function startWatching() {

        /**
         * Check if the browser support the FileReader function.
         * @param  {object} typeof Check if FileReader is an existing function
         * @return {string}        The error message if function does not exists in the browser
         */
        if (typeof window.FileReader !== 'function') {
            displayError("The file API isn't supported on this browser yet. The program will not run properly!", "danger");
            return;
        }

        /**
         * Will hold the file as file name with an internal pointer to the selected file
         * @var {string} \The selected file
         */
        var file;

        /**
         * Get current state of the input field
         * @var {object} \The input field
         */
        input = document.getElementById('filename');

        /**
         * 1. Check if file field exists
         * 2. Check if browser supports file field type | [type="file"]
         * 3. Check if user selected a file before clicking
         * 4. Start watching file if previous checks failed.
         * @param {object} \The current state of the input field
         */
        if (!input) {
            displayError("Um, couldn't find the filename element.", "warning");
            return;
        }
        else if (!input.files) {
            displayError("This browser doesn't seem to support the `files` property of file inputs.", "warning");
            return;
        }
        else if (!input.files[0]) {
            displayError("Please select a file before clicking 'Watch'", "warning");
            return;
        }
        else {
            displayError("Watching file", "success");

            /**
             * Run tick function on set interval time
             * @param {function} \The function to call
             * @param {integer}  \The interval time set in milliseconds
             */
            setInterval(tick, 1000);
        }
    }

    /**
     * Function to get current file input state and read local file
     * @return {bool} True|False
     */
    function tick() {

        /**
         * @var {object} file The current state of the input file field
         */
        var file = input.files && input.files[0];

        /**
         * @var {integer} previousFileSize The previous filesize stored in sessionStorage
         */
        var previousFileSize = sessionStorage.getItem(file.name + 'filesize');

        /**
         * @var {integer} currentFileSize The current filesize
         */
        var currentFileSize = input.files && input.files[0].size;

        /**
         * sessionStorage handle, store a key|value pair
         * @param {string} name            The keyname
         * @param {string} currentFileSize The current filesize
         * @note Added file.name to have an unique key and be able to track multi files in multiple tabs
         */
        sessionStorage.setItem(file.name + 'filesize',currentFileSize);

        /**
         * Check if filesize changed since previous check
         */
        if(previousFileSize != currentFileSize) {

            /**
             * Get the Filereader
             * @var {object} reader
             */
            var reader = new FileReader();

            /**
             * EventListener, will trigger everytime the reader.readAsText() function is used
             * @param {string} event Required to be set to 'load'
             */
            reader.addEventListener('load', function() {

                /**
                 * Print file content to browser ~ for development only
                 * document.getElementById('file').innerText = this.result;
                 */

                /**
                 * @var {string} text The file content
                 */
                var text = this.result;

                /**
                 * HTML element ID to add response to ~ for development only
                 * @var {string} resp
                 */
                var resp = $("#response");

                /**
                 * Pass variables for processing
                 * @param {string}        type post|get Default 'POST'
                 * @param {string|global} url  URL receiving script relative|absolute ~ local|hosted
                 * @param {array|json}    data The data to send to the script
                 */
                $.ajax({
                    type: "POST",
                    url: "system/processor.php",
                    data: {
                        filename : file.name,
                    },

                    // Before call ajax you can do activity like please wait message
                    beforeSend: function(xhr){
                        resp.html("Please wait...");
                    },

                    // Will call if method not exists or any error inside php file
                    error: function(qXHR, textStatus, errorThrow){
                        resp.html("There are an error");
                    },

                    success: function(data, textStatus, jqXHR){
                        resp.html(data);
                    }

                });

            });
            reader.readAsText(document.querySelector('input').files[0]);
        }

    }

    /**
     * Generate an error message
     * @param  {string} errorMessage The error message
     * @param  {String} type Warning type | Default is 'warning'
     * @return {string} The generated message success|warning|error
     */
    function displayError(errorMessage, type = 'warning') {
        $('.wrapper').append('<p class="alert-' + type + '" >' + errorMessage + '</p>');
    }

});
