# William Lin, Jeff Lin, Calvin Chu, Kevin Cai - Team potato_monkeys
# SoftDev2 pd9
# P04 - Let the Data Speak
# 2020-04-30

from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def root():
    return render_template('index.html')

if __name__ == "__main__":
    app.debug = True
    app.run()
