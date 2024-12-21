<%@ include file = "login_page2.html" %>
<%@ page import = "java.sql.*" %>
<%@ page import = "jprog.*"%>
<%
String username = request.getParameter("l_username");
String password = request.getParameter("l_password");
String email = request.getParameter("l_email");
String pvalue1 = username;
String pvalue2 = email;

ResultSet rs;
String query;
try{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/sanjjey?sslmode=disable","root","jeysanjjey2736");
    query = "select * from login_player where username=? and password=?;";
    PreparedStatement ps = conn.prepareStatement(query);
    ps.setString(1,username);
    ps.setString(2,password);
    rs = ps.executeQuery();
    Login l = new Login(username,password);
    String error = l.usernameValid(username);
    if(error==""){
    String pvalue3;
    if(rs.next()){
          Login ln = new Login(username,password,email,rs.getString(4));
          String s = ln.Display();
          pvalue3= rs.getString(4);
          System.out.println(s);
          session.setAttribute("pvalue1",pvalue1);
          session.setAttribute("pvalue2",pvalue2);
          session.setAttribute("pvalue3",pvalue3);
          response.sendRedirect("player.html");}
    else{
         out.println("<h1 style='margin-left:27rem;margin-top:-10rem;margin-bottom:5rem;'>"+"INVALID CREDENTIALS"+"</h1>");}
    }
    else{
        out.println("<h2 style='margin-left:24rem;margin-bottom:7rem;margin-top:-10rem'>"+error+"</h2>");
    }
}
catch(Exception e){
    out.println(e);
}
%>
