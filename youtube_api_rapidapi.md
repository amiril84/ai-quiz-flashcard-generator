Code Snippets, Client : Requests
-----------------------------------
import requests

url = "https://youtube-transcript3.p.rapidapi.com/api/transcript"

querystring = {"videoId":"ZacjOVVgoLY"}

headers = {
	"x-rapidapi-key": "5c4d84b79amsh11308407580c15dp1c1594jsnc66a22215dca",
	"x-rapidapi-host": "youtube-transcript3.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())


Example Response (BODY)
-----------------------------
{
  "success": true,
  "transcript": [
    {
      "text": "I can almost hear the gears turning in",
      "duration": 3.24,
      "offset": 0.04,
      "lang": "en"
    }
  ]
}

Example Response (SCHEMA)
------------------------------
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "transcript": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string"
          },
          "duration": {
            "type": "number"
          },
          "offset": {
            "type": "number"
          },
          "lang": {
            "type": "string"
          }
        }
      }
    }
  }
}

API DOC
------------
API Overview
100 Free Requests Every Month | 24/7 Uptime Monitoring for 100% Service Level | Always Up-to-Date with API Latest Changes | Private Plans? DM Us via RapidAPI

High-performance and reliable, our API is built for large-scale production applications, ensuring consistent service, 100% uptime, and exceptional scalability.

Why Choose Us?

Multiple Fallback Support: Ensure high availability with fallback methods and proxy support.

Easy Integration: Fetch transcripts with a simple API call using just a video ID or URL.

Multilingual Support: Access transcripts in various languages to serve diverse global audiences.

Flexible Response Formats: Receive data in JSON for easy integration or flat text for simple readability.

Don’t miss out, Get started today!

Get Transcripts Instantly – From Video ID or URL, 100 Free Requests Every Month! Always Up-to-Date with Latest Updates.

API Documentation
Language Flag:

Please note, If no language flag is provided, the available transcript will be returned. Some videos may have transcripts in languages other than English. You can omit the language parameter if it's not a concern.

lang=auto
Endpoint: GET /api/transcript-with-url
Description: This endpoint retrieves the transcript of a video based on the provided url. Optionally, the transcript language can be specified .### Request Parameters

Query Parameters:
Parameter	Type	Required	Description
url	String	Yes	The unique ID of the video for which the transcript is to be retrieved.
lang	String	No	The language code for the transcript. If not provided, the default language is English (en).
Supported languages: en, cn, ok (English, Chinese, Korean).
flat_text	Boolean	No	Get transcript as flat text.


Endpoint: GET /api/transcript
Description: This endpoint retrieves the transcript of a video based on the provided videoId. Optionally, the transcript language can be specified.

Request Parameters
Query Parameters:
Parameter	Type	Required	Description
videoId	String	Yes	The unique ID of the video for which the transcript is to be retrieved.
lang	String	No	The language code for the transcript. If not provided, the default language is English (en).
Supported languages: en, cn, ok (English, Chinese, Korean).
flat_text	Boolean	No	Get transcript as flat text.
Example Request:
Response:
Success (200):
Regular Response:

{
    "success": true,
    "transcript": [
        {
            "text": "I can almost hear the gears turning in",
            "duration": 3.24,
            "offset": 0.04,
            "lang": "en"
        }
    ]
}
Flat Text Response:

{
"success": true,
"transcript": "I can almost hear the..."
}
Failure (200):
If the videoId is not provided:

{
    "success": false,
    "error": "YouTube video ID is required"
}
If the url is not provided:

{
    "success": false,
    "error": "YouTube video url is required"
}
If the transcript fetching fails or transcript does'nt exist:

{
    "success": false,
    "error": "Failed to fetch transcript"
}
