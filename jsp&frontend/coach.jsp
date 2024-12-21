<%@ include file = "coach.html" %>
<%@ page import = "java.sql.*" %>
<%
String value1 = (String) session.getAttribute("value1");

try{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    String query = "select * from posting where username=?;";
    PreparedStatement ps = conn.prepareStatement(query);
    ps.setString(1,value1);
    ResultSet rs = ps.executeQuery();
    String val1,val2,val3;

    while(rs.next()){
        val1 = rs.getString(1);
        val2 = rs.getString(2);
        val3 = rs.getString(3);
        out.println("<div style=' border:2px solid white;border-radius:20px;z-index:1;display:inline-block;background-color:black;width:45rem;padding-left:30rem;box-border:padding-border;box-shadow: blueviolet 0px 20px 40px, blueviolet 0px -20px 40px, blueviolet 0px 4px 6px, blueviolet 0px 12px 13px, blueviolet 0px -3px 5px;padding-right:-40rem;'>Coach: "+val1+"<br><br><br> Strategy:"+val2+"<br><br><br> Game:"+val3+"</div><br><br><br><br><br>");
    }
}
catch(Exception e){
    out.println(e);
    }
%>