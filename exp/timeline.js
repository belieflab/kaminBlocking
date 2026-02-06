switch (webgazer) {
    case true:
        $.getScript("exp/timeline-webgazer.js");
    case false:
        $.getScript("exp/timeline-no-webgazer.js");
}
