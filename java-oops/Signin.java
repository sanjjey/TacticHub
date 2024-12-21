package jprog;

public class Signin extends abclass {
    private String un,ps,em,age;
    public Signin(String un,String ps,String em,String age){
        this.un=un;
        this.ps=ps;
        this.em=em;
        this.age=age;
    }
    public Signin(String un,String ps){
        this.un=un;
        this.ps=ps;
    }
    public String Display(){
        if(un!=null && ps!=null && em!=null && age!=null) {
            return ("Player :"+un+"\nAge: "+age);

        }
        else{
            return null;
        }
    }

    public class InvalidUsername extends Exception{
        public InvalidUsername(String msg){
            super(msg);
        }
    }

    public String usernameValid(String uns) throws InvalidUsername{
        char[] ch = new char[uns.length()];
        boolean mat=false;

        try {
            if (uns.length() < 3) {
                mat = false;
                throw new InvalidUsername("Username is invalid");

            } else if (un.contains(" ")) {
                throw new InvalidUsername("Username is invalid");
            } else {
                return "";
            }
        }
        catch(InvalidUsername e){
            return e.getMessage();

        }}
        @Override
        public boolean passwordStrength(String ps) {
            if (ps.length() <= 3) {
                return false;
            }
            for (int i = 0; i < ps.length(); i++) {
                char ch1 = ps.charAt(i);
                if (ch1 == '!' || ch1 == '@' || ch1 == '$' || ch1 == '^' || ch1 == '%' || ch1 == '&' || ch1 == '*'|| ch1 == '~') {
                    return true;
                }
            }
            return false;
        }
    }
