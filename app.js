(function ($) {

	var userDiary = loadUserDiary();

	if (userDiary)
	{
		displayAllDiaryEntries(userDiary);

		// if user doesn't have any entries show form to create first entry
		if (userDiary.entries.length == 0)
		{
			$("#entry_create_form").removeClass("hide");
		}

		// display add new entry button
		$("header").append("<button id='create_entry_button'>+ Create entry</button>");

		// add entry button handler
		$("#create_entry_button").click(function (e) {

			$("#entry_subject").val("");
			$("#entry_message").val("");
			$("#entry_create_form").removeClass("hide");
			$("#entry_create_form input").first().focus();
		
		});

		// delete entry event handler
		$(".entries").on(
			"click", 
			".delete_entry_button", 
			function (e) {
				var entryId = $(e.target).parent().data("id");

				if (typeof entryId !== 'undefined')
				{
					deleteEntry(entryId);
				}
		});

		// sets edit mode on entry
		$(".entries").on(
			"click", 
			".begin_edit_entry_button", 
			function (e) {
				var entryId = $(e.target).parent().data("id");

				if (typeof entryId !== 'undefined')
				{
					enterEntryEditMode(entryId);
				}
		});

		// exits edit mode on entry
		$(".entries").on(
			"click", 
			".cancel_update_entry_button", 
			function (e) {
				var entryId = $(e.target).parent().data("id");

				if (typeof entryId !== 'undefined')
				{
					exitEntryEditMode(entryId);
				}
		});

		// updates entry in edit mode
		$(".entries").on(
			"click", 
			".update_entry_button", 
			function (e) {
				var entryId = $(e.target).parent().data("id");

				if (typeof entryId !== 'undefined')
				{
					updateEntry(entryId);
					exitEntryEditMode(entryId);
				}
		});


		// hide form
		$("#entry_cancel_create_button").click(function (e) {
			$("#entry_create_form").addClass("hide");
		});

		// listen for creation of new entries
		$("#entry_create_form").submit(function (e) {

			// get values subject, message, geo tag preference and create an entry
			var subject = $("#entry_subject").val();
			var message = $("#entry_message").val();
			var geoTag = $("#entry_geo_tag").is(":checked");

			if (geoTag)
			{
				getUserLocation(function (success, pos) {
					createEntry(subject, message, pos);
				});
			}
			else
			{
				createEntry(subject, message);
			}

			$("#entry_create_form").addClass("hide");
			e.preventDefault();
		});
	}
	else
	{
		// web browser not supported
		$('.entries').html('This web browser is not supported.');
	}

	

	// Helper functions
	function loadUserDiary() 
	{
		if (hasLocalStorage())
		{
			var diaryJson = localStorage.getItem('diary');

			if (diaryJson)
			{
				return Diary.fromJson(toJson(diaryJson));
			}
			else
			{
				return new Diary;
			}
			
		}

		return null;
	}

	function storeUserDiary()
	{
		if (hasLocalStorage())
		{
			var diaryJson = Diary.toJson(userDiary);
			try {
				localStorage.setItem("diary", toStr(diaryJson));
			} catch (e) {
				alert("Memory full! Please delete some old entries");
			}
		}
	}

	function hasLocalStorage()
	{
		// modernizer approach to feature test local storage, without other unneccesary additons
		var mod = 'modernizr';
	    try {
	        localStorage.setItem(mod, mod);
	        localStorage.removeItem(mod);
	        return true;
	    } catch(e) {
	        return false;
	    }
	}
	function hasGeolocation()
	{
		if (navigator.geolocation)
		{
			return true;
		}
		
		return false;
	}

	function toJson(str)
	{
		return JSON.parse(str);
	}
	function toStr(json)
	{
		return JSON.stringify(json);
	}
	
	function formatDate(date) // I hope I did this right
	{
		var monthNames = [
		  "January", "February", "March",
		  "April", "May", "June", "July",
		  "August", "September", "October",
		  "November", "December"
		];

		var monthRaw = date.getMonth();
		var dayRaw = date.getDate();
		var yearRaw = date.getFullYear();

		var hourRaw = date.getHours();
		var minutesRaw = date.getMinutes();

		var day = dayRaw;
		var year = yearRaw;

		// zero padding minutes
		var minutes = minutesRaw < 10? "0" + minutesRaw: minutesRaw;

		// month string formatting
		var month = monthNames[monthRaw];

		// change from 0 - 23 to 12 pm - 12 am
		var hour = hourRaw % 12;
		
		// 0 cooresponds to either noon or midnight (0 or 12 in old format)
		if (hour == 0)
		{
			hour = 12;
		}

		var amPm;
		if (hourRaw >= 12)
		{
			var amPm = "pm";
		}
		else
		{
			amPm = "am";
		}

		return month + " " + day + ", " + year + " at " + hour + ":" + minutes + " " + amPm;
	}

	function displayEntry(entry)
	{
		var html = "<article class='cf' data-id=" + entry.id + ">" +
						"<h2 class='subject'>" + entry.subject + "</h2>" +
						"<span class='date'>" + "Posted on " + formatDate(entry.date) + "</span>" +
						"<p class='message'>" + entry.message + "</p>" +
						"<button class='begin_edit_entry_button icon-mode_edit'></button>" +
						"<button class='delete_entry_button icon-delete'></button>" +
					"</article>";

      	$(".entries").prepend(html);
	}

	function displayAllDiaryEntries(diary)
	{
		// display all entries
		var entries = diary.entries;

		// display existing entries in diary
		for (var i = 0; i < entries.length; ++i)
		{
			var entry = entries[i];
			displayEntry(entry);
		}
	}

	function createEntry(subj, messg, pos)
	{
		var entry = userDiary.createEntry(subj, messg, pos);
		displayEntry(entry);

		storeUserDiary();
	}

	function updateEntry(entryId)
	{
		var subj = $(".entries article[data-id='" + entryId + "'] .new_entry_subject").val();
		var message = $(".entries article[data-id='" + entryId + "'] .new_entry_message").val();

		userDiary.editEntry(entryId, subj, message);
		storeUserDiary();
	}

	function deleteEntry(entryId)
	{
		userDiary.deleteEntry(entryId);
		storeUserDiary();
		$(".entries > article[data-id='" + entryId + "']").remove();
	}

	// places entry in edit mode
	function enterEntryEditMode(entryId)
	{
		var entry = userDiary.getEntry(entryId);
		$(".entries article[data-id='" + entryId + "'] .subject").replaceWith("<label>Subject<input class='new_entry_subject' type='text' value='" + entry.subject + "'></label>");
		$(".entries article[data-id='" + entryId + "'] .message").replaceWith("<label>Message<textarea class='new_entry_message'>" + entry.message + "</textarea></label>");
		$(".entries article[data-id='" + entryId + "'] .delete_entry_button").replaceWith("<button class='update_entry_button'>Save changes</button>");
		$(".entries article[data-id='" + entryId + "'] .begin_edit_entry_button").replaceWith("<button class='cancel_update_entry_button'>Cancel</button>");

		// hide date
		$(".entries article[data-id='" + entryId + "'] .date").addClass("hide");
	}

	function exitEntryEditMode(entryId)
	{
		var entry = userDiary.getEntry(entryId);
		$(".entries article[data-id='" + entryId + "'] .new_entry_subject").parent().replaceWith("<h2 class='subject'>" + entry.subject + "</h2>");
		$(".entries article[data-id='" + entryId + "'] .new_entry_message").parent().replaceWith("<p class='message'>" + entry.message + "</p>");
		$(".entries article[data-id='" + entryId + "'] .update_entry_button").replaceWith("<button class='delete_entry_button icon-delete'></button>");
		$(".entries article[data-id='" + entryId + "'] .cancel_update_entry_button").replaceWith("<button class='begin_edit_entry_button icon-mode_edit'></button>");

		// show date
		$(".entries article[data-id='" + entryId + "'] .date").removeClass("hide");
	}

	function getUserLocation(callback)
	{
		if (hasGeolocation())
		{
			navigator.geolocation.getCurrentPosition(
				function (pos) {
					callback(true, pos);
				},
				function (err) {
					callback(false);
				}
			);
		}
		else
		{
			callback(false);
		}
	}

})(jQuery);