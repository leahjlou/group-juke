;( function( $ ) {

    var pusher,
        smsChannel,
        songList,
        currChoices,
	    appCode;

    function init() {

	    appCode = genAppCode();
	    $(".appcode").html(appCode);

        pusher = new Pusher(PUSHER_CONFIG.APP_KEY);

        smsChannel = pusher.subscribe('sms');
        smsChannel.bind( 'sms_received', smsReceived );

        songList = new Array("Andrew McMahon - Synethesia",
            "Ben Folds - Rockin' The Suburbs",
            "Brandon Flowers - Crossfire",
            "Daft Punk - Harder, Better, Faster, Stronger",
            "Daft Punk - One More Time",
            "Death Cab For Cutie - Crooked Teeth",
            "Death Cab For Cutie - Title And Registration",
            "Foster the People - Helena Beat",
            "Foster the People - Pumped Up Kicks",
            "Jack's Mannequin - MFEO Part 1",
            "Jack's Mannequin - I'm Ready",
            "Julian Casablancas - 11th Dimension",
            "Radiohead - Karma Police",
            "Radiohead - Reckoner",
            "Shiny Toy Guns - Ricochet!",
            "Sublime - Santeria",
            "Sublime - What I Got",
            "Sublime - The Wrong Way",
            "Taylor Swift - You Belong With Me",
            "The Bravery - Believe",
            "The Bravery - Time Won't Let Me Go",
            "The Killers - Read My Mind",
            "The Killers - Somebody Told Me",
            "The Killers - Spaceman",
            "The Smashing Pumpkins - 1979",
            "The Smashing Pumpkins - Bullet With Butterfly Wings",
            "The Smashing Pumpkins - Cherub Rock",
            "The Smashing Pumpkins - Today",
            "The Who - Baba O'Riley",
            "The Who - My Generation",
            "The Who - Won't Get Fooled Again",
            "Weezer - Buddy Holly",
            "Weezer - Island In The Sun",
            "Weezer - Say It Ain't So",
            "Weezer - The Sweater Song"
        );

        //play a random song to begin
        var rand = Math.floor(Math.random()*songList.length);
        var firstSong = (songList[rand]);
        var firstSrc = "https://s3-us-west-1.amazonaws.com/twiliojukeboxsongs/" + firstSong + ".mp3";
        $("#currSongTitle").html(firstSong);
        //once a song has played, remove it from the songlist
        var indexToRemove = songList.indexOf(firstSong);
        songList.splice(indexToRemove, 1);
        var audio = $("#player");
        $("#player").attr("src", firstSrc);
        audio[0].pause();
        audio[0].load();//suspends and restores all audio element
        //audio[0].play();

        currChoices = new Array("Song 1", "Song 2", "Song 3", "Song 4");

        getNewChoices();

        $("audio").each(function ()
        {
            this.addEventListener("ended", function ()
            {
                songEnded();
            })
        })
    }

    // SMS
    function smsReceived(data) {
        var el = createSmsEl(data);
        el.hide();
        if (el.length > 0)
        {
            $('#sms_messages').prepend(el);
            el.slideDown();
        }
    };

    function createSmsEl(data) {
        var body = data.text;
	    var words = body.split("-", 2);
	    var thisAppCode = words[0];
	    var voteStr = words[1];
	    var voteNum;

	    if ((thisAppCode.toLowerCase() == appCode.toLowerCase()) && (voteStr.length == 1))
	    {
		    voteNum = parseInt(voteStr);
		    if (!isNaN(voteNum))
		    {
			    switch (voteNum)
			    {
				    case 1:
					    voteNum = 1;
					    break;
				    case 2:
					    voteNum = 2;
					    break;
				    case 3:
					    voteNum = 3;
					    break;
				    case 4:
					    voteNum = 4;
					    break;
				    default:
					    voteNum = 0;
			    }
		    }
	    }


        if (voteNum > 0)
        {
            var li = '' +
                '<li>' +
                '<div class="message">' + "Someone with the number " + data.from_city + " voted <span class=\"num\">" + (voteNum) + '</span></div>' +
                '</li>';

            voteForSong(voteNum);
        }

        return $(li);
    }

    function voteForSong(num)
    {
        var selector = "span.song" + num + "votes";
        var currCount = $(selector).html();
        var newCount = parseInt(currCount) + 1;
        $(selector).html(newCount.toString());
    }

    function getNewChoices()
    {
        //choose random songs from songList
        //don't duplicate the same song in the same set of current choices
        for (var i=0; i<4; i++)
        {
            var randSong = "";
            while (true)
            {
                var rand = Math.floor(Math.random()*songList.length);
                randSong = songList[rand];
                if (currChoices.indexOf(randSong) == -1)
                    break;
            }
            currChoices[i] = randSong;
        }

        //put currChoices in the songXtitle span element
        for (var i=0; i<4; i++)
        {
            var selector = "#song" + (i+1) + "title";
            var title = currChoices[i];
            $(selector).html(title);
        }
    }


    function songEnded()
    {
        //calculate the winner of this round
        //play the new song
        //pick new song choices
        //reset all the vote counts

        //once a song has played, remove it from the songlist
        var song1votes = parseInt($("span.song1votes").html());
        var song2votes = parseInt($("span.song2votes").html());
        var song3votes = parseInt($("span.song3votes").html());
        var song4votes = parseInt($("span.song4votes").html());

        var winningSong;

        var maxVotes = Math.max(song1votes, song2votes, song3votes, song4votes);
        if (song1votes == maxVotes) {
            winningSong = currChoices[0];
        } else if (song2votes == maxVotes) {
            winningSong = currChoices[1];
        } else if (song3votes == maxVotes) {
            winningSong = currChoices[2];
        } else {
            winningSong = currChoices[3];
        }

        //once a song has played, remove it from the songlist
        var indexToRemove = songList.indexOf(winningSong);
        songList.splice(indexToRemove, 1);

        var newSource = "https://s3-us-west-1.amazonaws.com/twiliojukeboxsongs/" + winningSong + ".mp3";
        $("#currSongTitle").html(winningSong);

        var audio = $("#player");
        $("#player").attr("src", newSource);

        audio[0].pause();
        audio[0].load();//suspends and restores all audio element
        audio[0].play();

        getNewChoices();

        $("span.song1votes").html("0");
        $("span.song2votes").html("0");
        $("span.song3votes").html("0");
        $("span.song4votes").html("0");
    }

	function genAppCode()
	{
		var text = "";
		var possible = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

		for (var i=0; i < 2; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}


    $(init);

} )( jQuery );