/*************************************************
 **********  Add Previous Store Function *********
 *************************************************/

$(function () {
    $("#addPrevButton").click(function () {
        var inside = "<div class=\"form-group\">\n" +
            "                                        <label for=\"retailSelect\">:</label>\n" +
            "                                        <select class=\"form-control\" id=\"retailSelect\">\n" +
            "                                            <option>1</option>\n" +
            "                                            <option>2</option>\n" +
            "                                            <option>3</option>\n" +
            "                                            <option>4</option>\n" +
            "                                        </select>\n" +
            "                                    </div>\n" +
            "                                    <div class=\"form-group\">\n" +
            "                                        <label for=\"store\">Store Number:</label>\n" +
            "                                        <input type=\"number\" class=\"form-control\" id=\"store\" placeholder=\"Enter store number\" name=\"store\">\n" +
            "                                    </div>\n" +
            "                                    <div class=\"form-group\">\n" +
            "                                        <label for=\"dateFrom\">Date from:</label>\n" +
            "                                        <input type=\"date\" class=\"form-control\" id=\"dateFrom\" placeholder=\"Enter date from\" name=\"dateFrom\">\n" +
            "                                    </div>\n" +
            "                                    <div class=\"form-group\">\n" +
            "                                        <label for=\"dateTo\">Last Name:</label>\n" +
            "                                        <input type=\"date\" class=\"form-control\" id=\"dateTo\" name=\"dateTo\">\n" +
            "                                    </div>\n" +
            "                                    <div class=\"form-group\">\n" +
            "                                        <label for=\"role\">Select list:</label>\n" +
            "                                        <select class=\"form-control\" id=\"role\">\n" +
            "                                            <option value=\"till\">Till</option>\n" +
            "                                            <option value=\"till+\">Till+</option>\n" +
            "                                            <option value=\"super\">Supervisor</option>\n" +
            "                                            <option value=\"mngr\">Manager</option>\n" +
            "                                        </select>\n" +
            "                                    </div>";
        generatePopup(inside);
    })
})