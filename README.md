# HandsUP! - Oxford Hack 2018
Submission for the JP Morgan/Microsoft challenges.

## Project Description
### Inspiration
HandsUp! to save people from torment in natural disaster. Our product help to map, match and connect people in need with people who offers help. Put your HandsUp! to bring changes to people’s lives- here is where supermen are born.

### What it does
Sourcing data from Facebook and Twitter, our Machine Learning model determines if a specific person or location needs help or not. The data is automatically categorised for users of the app (people who offers help); while a World coloured contour map shows the emergency locations which most help is needed. All data is updated in real-time, while the app can be used globally with the translation function built in.

### How we build it
Using Machine Learning Model deployed on Azure and Facebook API we can predict whether person needs help or not and then we publish post on the web app. It also sources Twitter posts using Azure Logic Connections using #DisasterResponse. By embedding Azure Text Translator API into the project, we are able to process posts written in different languages. We added a lot of different features to our design such as World HeatMaps, downvoting or upvoting the posts, filtering tools, facebook button to make it more convenient and practical to use for a person without technical background.

Technologies:
* Azure - machine learning studio, SQL server
* Python - spaCy NLP, Flask backend
* JavaScript - node.js/Express.js managing backend logic with Passport for authentication
* HTML/CSS - webapp

### Challenges we ran into
Insufficient data to implement our product; integration of the whole design from back-end to front-end.

### What we learned
Social media data can be extracted and interweaved with Azure to implement life-saving activities.

### What’s next for test
Our next step is to create a mobile app, building a chat room between the user and the need seeker in the ‘help’ button and sort people in need according to the location near the user. We were also thinking about using Computer Vision to recognise if the images posted by users are related to natural disaster.

## Getting started

### Word similarity service (backed by spaCy)
Backed by spaCy, runs on port `5000`.
```
$ cd src/word_similarity

########################################
# Only include during first time setup
$ python3 -m venv venv
########################################

$ source venv/bin/activate
$ pip install -r requirements.txt
$ python3 similarity.py
```

### Webapp
Full-stack, runs on port `3000`.
```
$ npm install
$ npm start
```