group-juke
==========

A music streaming service that lets the crowd participate in the music selection.

People can text in their song choices to the given phone number, and the music player will queue the songs with the most votes. It uses Twilio and Pusher to do some nifty things with SMS and web sockets.

It's more of a proof of concept than anything, but it was really fun to put together my first week at Twilio.

Note: For copyright reasons, audio files (which were on a public AWS S3 bucket) are not live anymore. But real-time SMS voting is still up and running at <a href="http://group-juke.herokuapp.com">group-juke.herokuapp.com</a>