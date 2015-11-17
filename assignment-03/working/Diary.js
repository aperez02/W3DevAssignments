// Entry object to encapsulate entry logic
function Entry (id, subject, message, date, location) {
	this.id = id || 0;
	this.date = date || new Date;
	this.subject = subject || "";
	this.message = message || "";
	this.location = location;
};

Entry.fromJson = function (json) {
	var id = json.id;
	var subject = json.subject;
	var message = json.message;
	var date = new Date(json.date);
	var location = json.location;

	return new Entry(id, subject, message, date, location);
};

Entry.toJson = function (entry) {
	var json = {};

	json.id = entry.id;
	json.subject = entry.subject;
	json.message = entry.message;
	json.date = entry.date.toJSON();
	json.location = entry.location;

	return json;	
};

// Diary object to encapsulate diary logic and managing entry application state
function Diary (entries, idState) {
	this.entries = entries || [];
	this.idState = idState || 0;


	this.generateId = function () {
		return this.idState++;
	};

	this.createEntry = function (subject, message, location) {
		var id = this.generateId();
		var date = new Date;

		var newEntry = new Entry(id, subject, message, date, location);

		this.entries.push(newEntry);

		return newEntry;
	};

	this.getEntry = function (id) {
		var entries = $.grep(this.entries, function (entry) {
			return entry.id == id;
		});

		if (entries.length > 0) return entries[0];
		else return null;
	};

	this.deleteEntry = function (id) {
		var entry = this.getEntry(id);

		if (entry)
		{
			var index = this.entries.indexOf(entry);
			if (index > -1)
			{
				this.entries.splice(index, 1);
			}
		}
		
	};

	this.editEntry = function (id, subject, message) {
		var entry = this.getEntry(id);

		if (entry)
		{
			entry.subject = subject || entry.subject;
			entry.message = message || entry.message;
		}
	};
};

Diary.fromJson = function (json) {
	var entriesJson = json.entries || [];
	var idState = json.id_state || 0;

	var entries = [];
	for (var i = 0; i < entriesJson.length; ++i)
	{
		entries.push(Entry.fromJson(entriesJson[i]));
	}

	return new Diary(entries, idState);

};

Diary.toJson = function (diary) {
	var json = {};

	var entries = diary.entries;
	
	var entriesJson = [];
	for (var i = 0; i < entries.length; ++i)
	{
		entriesJson.push(Entry.toJson(entries[i]));
	}

	json.id_state = diary.idState;
	json.entries = entriesJson;

	return json;
}
