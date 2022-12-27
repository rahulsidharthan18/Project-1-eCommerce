var nameError=document.getElementById('name-error')
        var emailError=document.getElementById('email-error')
        var passwordError=document.getElementById('password-error')
        var confirmpasswordError=document.getElementById('confirmpassword-error')
        var submitError=document.getElementById('submit-error')
        var phoneError=document.getElementById('phone-error')
        
        
        function validateName(){
         
            var name=document.getElementById('check-name').value;
        
            if(name.length==0){
                nameError.innerHTML = 'Name is required';
                return false;
            }
            else if(!name.match(/^[A-Za-z]+ [A-Za-z]+$/)){
                nameError.innerHTML ='Write Full Name';
                return false;
            }
            else{
                nameError.innerHTML ='<i class="fa-solid fa-circle-check"></i>';
                return true;
            }
        
            
        }
        function validateEmail(){
        
            var email=document.getElementById('check-email').value;
            if(email.length==0){
                emailError.innerHTML ='Email is required';
                return false;
        
            }
           else if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)){
                emailError.innerHTML='Email Invalid';
                return false;
            }
            else{
                emailError.innerHTML ='<i class="fa-solid fa-circle-check"></i>';
                return true;
            }
        }
        function validatePassword(){
        
            var password=document.getElementById('check-password').value
        
            var minNumberofChars = 6;
            var maxNumberofChars = 16;
            var regularExpression  = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/; 
            if(password.length < minNumberofChars || password.length > maxNumberofChars){
                passwordError.innerHTML='password invalid';
                return false;
            }
            else if(password.length==0){

                passwordError.innerHTML='password is required'
            }
          else if(!regularExpression) {
                passwordError.innerHTML='password should be 6 character or number';
                return false;
            }
            else{
                passwordError.innerHTML ='<i class="fa-solid fa-circle-check"></i>';
                return true;
            }
        }
        function validateConfirmPassword(){
        var password=document.getElementById('check-password').value
          var Confirmpassword=document.getElementById('check-confirmpassword').value;
        
            if(Confirmpassword.length==0){
              
                confirmpasswordError.innerHTML='password is required';
                return false;
            }
            else if(password==Confirmpassword){

                confirmpasswordError.innerHTML ='<i class="fa-solid fa-circle-check"></i>';
                return true;
                
            }
            else{
                confirmpasswordError.innerHTML='check the confirm password';
                return false;
            }
        }
        function validatephonenumber(){
         
            var phone=document.getElementById('check-phone').value;
            if(phone.length == 0)
            {
                phoneError.innerHTML="Phone required";
                return false;
            }else
            if(phone.length<10||phone.length>10 )
            {
                phoneError.innerHTML="10 digits required";
                return false;   
            }else
            if(!phone.match(/^[0-9]{10}$/)){
                phoneError.innerHTML="not valid";
                return false; 
            }else
            phoneError.innerHTML='<i class="fa-solid fa-square-check"></i>';
            return true;

        }
        function validateForm(){
        
            var submit =document.getElementById('check-submit').value;
            if(! validateName() || ! validateEmail() || ! validatePassword() || ! validateConfirmPassword() || ! validatephonenumber()){
                submitError.style.display ='block';
                submitError.innerHTML='please fill the form';
                setTimeout(function(){submitError.style.display ='none';},3000);
                return false;
            }
            else{
                return true;
            }
        }