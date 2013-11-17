{
"options": {
	"socketHost" : "http://localhost:8081"
},
"seats": {
	"Student" : {
		"Productive" : "Speaker",
		"Receptive" : "Respondent"
	}, 
	"Teacher" : {
		"Receptive" : "Speaker",
		"Productive" : "Respondent"
	}
},
"taskTypes": {
	"Taboo" : {
		"Descriptions" : {
			"Respondent" : [ 
				"相手の説明を聞いて、説明されている言葉を正しく答えた時点で、「Done」のボタンをタッチして下さい。",
				"Please touch the \"Done\" button below when you have correctly guessed the word that the speaker is describing." 
			],
			"Speaker" : [
				"次の言葉を使わずに、その言葉を説明して下さい。相手が正しく答えたら、相手に教えてあげて下さい。「Go」のボタンをタッチして、始めて下さい。",
				"Please describe the word below without using it. When your partner has guessed the word, tell him/her. Touch \"Go\" to begin."
			]
		}
	},
	"Picture": {
		"Descriptions" : {
			"Respondent" : [ 
				"相手に説明されている絵をタッチして下さい。",
				"Please touch the picture being described by the speaker." 
			],
			"Speaker" : [
				"下に表示されている絵を説明して下さい。「Go」のボタンをタッチして、始めて下さい。",
				"Please describe the picture below. Touch \"Go\" to begin."
			]
		}
	},
	"Listen": {
		"Descriptions" : {
			"Respondent" : [ 
				"相手の説明を聞いて、そのどの内容の説明か分かったら、そのボタンをタッチして下さい。",
				"Listen to your partner’s explanation and touch the button for the content being described." 
			],
			"Speaker" : [
				"次のオーディオを聞いて、その内容を相手に説明して下さい。ヘッドフォンをつけ、「Go」のボタンをタッチして始めて下さい。",
				"Please listen to the following audio and explain it to your partner. Please put on the headphones and touch \"Go\" to begin."
			]
		}
	}
}
}
