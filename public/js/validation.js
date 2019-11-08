$(".navigation ul li a").css("opacity",1);
$(".navigation ul li a").mouseover(function() {
	$(this).fadeTo(500,0.9);
});
$(".navigation ul li a").mouseleave(function() {
	$(this).fadeTo(500,1);
});

$(document).ready(function() {
	$("#FirstName").val("");
	$("#LastName").val("");
	$("#Mobile").val("");
 	$("#EmailAddress").val("");
	$("#Password").val("");
	$("#Repassword").val("");
    $("#UserName").val("");

	//First Name
	$("#FirstName").focusin(function() {
		if($.trim($(this).val())=="") {
			$(this).val("");
			$(".response-FirstName").html("<h6 class='text-red'>Required</h6>");
		}
	})
	$("#FirstName").focusout(function() {
        if($.trim($(this).val())=="") {
			$(this).val("");
			fill_blank();
		}
	});
	$("#FirstName").keyup(function() {
		validate_FirstName($(this).val());
	});
	
	//Last Name
	$("#LastName").focusin(function() {
		if($.trim($(this).val())=="") {
			$(this).val("");
			$(".response-LastName").html("<h6 class='text-red'>Required</h6>");
		}
	})
	$("#LastName").focusout(function() {
        if($.trim($(this).val())=="") {
			$(this).val("");
			fill_blank();
		}
	});
	$("#LastName").keyup(function() {
		validate_LastName($(this).val());
	});
	
	//Mobile
	$("#Mobile").focusin(function() {
		if($.trim($(this).val())=="") {
			$(this).val("");
			$(".response-Mobile").html("<h6 class='text-red'>Required</h6>");
		}
	})
	$("#Mobile").focusout(function() {
        if($.trim($(this).val())=="") {
			$(this).val("");
			fill_blank();
		}
	});
	$("#Mobile").keyup(function(){
		validate_Mobile($(this).val());
	});
	
	//Email
	$("#EmailAddress").focusin(function() {
		if($.trim($(this).val())=="") {
			$(this).val("");
			$(".response-EmailAddress").html("<h6 class='text-red'>Required</h6>");
		}
	})
	$("#EmailAddress").focusout(function() {
        if($.trim($(this).val())=="") {
			$(this).val("");
			fill_blank();
		}
	});
	$("#EmailAddress").keyup(function() {
		validate_EmailAddress($(this).val());
	});
	
	//Password
	$("#Password").focusin(function() {
		if($.trim($(this).val())=="") {
			$(this).val("");
			$(".response-Password").html("<h6 class='text-red'>Required</h6>");
		}
	});
    $("#Password").focusout(function() {
        if($.trim($(this).val())=="") {
			$(this).val("");
			fill_blank();
		}
	});
	$("#Password").keyup(function() {
        validate_Password($(this).val());
    });
	
	//Repassword
	$("#Repassword").focusin(function(){
		if($.trim($(this).val())=="") {
			$(this).val("");
			$(".response-Repassword").html("<h6 class='text-red'>Required</h6>");
		}
	});
    $("#Repassword").focusout(function() {
        if($.trim($(this).val())=="") {
			$(this).val("");
			fill_blank();
		}
	});
	$("#Repassword").keyup(function() {
        validate_Repassword($(this).val());
    });

    //User Name
    $("#UserName").focusin(function() {
        if($.trim($(this).val())=="") {
            $(this).val("");
            $(".response-UserName").html("<h6 class='text-red'>Required</h6>");
        }
    })
    $("#UserName").focusout(function() {
        if($.trim($(this).val())=="") {
            $(this).val("");
            fill_blank();
        }
    });
    $("#UserName").keyup(function() {
        validate_UserName($(this).val());
    });

	$("#submit").click(function() {
		
		if($.trim($("#FirstName").val()) == "" && $.trim($("#LastName").val()) == "" && $.trim($("#Mobile").val()) == "" && $.trim($("#EmailAddress").val()) == "" && $.trim($("#Password").val()) == "" && $.trim($("#UserName").val()) == "") {
			$(".response-FirstName").html("<h6 class='text-red'>Required</h6>");
			$(".response-LastName").html("<h6 class='text-red'>Required</h6>");
			$(".response-Mobile").html("<h6 class='text-red'>Required</h6>");
			$(".response-EmailAddress").html("<h6 class='text-red'>Required</h6>");
			$(".response-Password").html("<h6 class='text-red'>Required</h6>");
            $(".response-UserName").html("<h6 class='text-red'>Required</h6>");
			$("#EmailAddress").focus();
			return false;
		} 
		
		if(document.getElementById('FirstName')) {
			if($.trim($("#FirstName").val()) == "") {
				$(".response-FirstName").html("<h6 class='text-red'>Required</h6>");
				$("#FirstName").focus();
				return false;
			} else if(validate_onFirstName() != "") {
				$(".response-FirstName").html("<h6 class='text-red'>Invalid</h6>");
				$("#FirstName").focus();
				return false;
			}	
		}
		
		if(document.getElementById('LastName')) {
			if($.trim($("#LastName").val()) == "") {
				$(".response-LastName").html("<h6 class='text-red'>Required</h6>");
				$("#LastName").focus();
				return false;
			} else if(validate_onLastName() != "") {
				$(".response-LastName").html("<h6 class='text-red'>Invalid</h6>");
				$("#LastName").focus();
				return false;
			}
		}
		
		if(document.getElementById('Mobile')) {
			if($.trim($("#Mobile").val()) == "") {
				$(".response-Mobile").html("<h6 class='text-red'>Required</h6>");
				$("#Mobile").focus();
				return false;
			} else if(validate_onMobile() != "") {
				$(".response-Mobile").html("<h6 class='text-red'>Invalid</h6>");
				$("#Mobile").focus();
				return false;
			}
		}
		
		if(document.getElementById('EmailAddress')) {
			if($.trim($("#EmailAddress").val()) == "") {
				$(".response-EmailAddress").html("<h6 class='text-red'>Required</h6>");
				$("#EmailAddress").focus();
				return false;
			} else if(validate_onEmailAddress() != "") {
				$(".response-EmailAddress").html("<h6 class='text-red'>Invalid</h6>");
				$("#EmailAddress").focus();
				return false;
			}
		}
		
		if(document.getElementById('Password')) {
			if($.trim($("#Password").val()) == "") {
				$(".response-Password").html("<h6 class='text-red'>Required</h6>");
				$("#Password").focus();
				return false;
			} else if(validate_onPassword() != "") {
				$(".response-Password").html("<h6 class='text-red'>Invalid</h6>");
				$("#Password").focus();
				return false;
			}
		}
		
		if(document.getElementById('Password') && document.getElementById('Repassword')) {
			if($.trim($("#Password").val()) != $.trim($("#Repassword").val())) {
				$(".response-Repassword").html("<h6 class='text-red'>Passwords doesn't match.</h6>");
				$("#Repassword").focus();
				return false;
			}
		}

        if(document.getElementById('UserName')) {
            if($.trim($("#UserName").val()) == "") {
                $(".response-UserName").html("<h6 class='text-red'>Required</h6>");
                $("#UserName").focus();
                return false;
            } else if(validate_onUserName() != "") {
                $(".response-UserName").html("<h6 class='text-red'>Invalid</h6>");
                $("#UserName").focus();
                return false;
            }
        }
		return true;
	});
});

function validate_FirstName(FirstName) {
	if(/^[a-zA-Z]*$/.test(FirstName)) {
		$(".response-FirstName").html("");
	} else {
		$(".response-FirstName").html("<h6 class='text-red'>Invalid first name, Only letters are allowed.</h6>");
	}
}

function validate_LastName(LastName) {
	if(/^[a-zA-Z]*$/.test(LastName)) {
		$(".response-LastName").html("");
	} else {
		$(".response-LastName").html("<h6 class='text-red'>Invalid last name, Only letters are allowed.</h6>");
	}
}

function validate_Mobile(Mobile) {
	if(/^\(?([0-9]{2})\)?[-. ]?([0-9]{2})[-. ]?([0-9]{6})$/.test(Mobile)) {
		$(".response-Mobile").html("");
	} else {
		$(".response-Mobile").html("<h6 class='text-red'>Invalid Mobile, Permit only mobile numbers with 10 digits.</h6>");
	}
}

function validate_EmailAddress(EmailAddress) {
	if(/([A-Za-z0-9\.\-\_\!\#\$\%\&\'\*\+\/\=\?\^\`\{\|\}]+)\@([A-Za-z0-9-_]+)(\.[A-Za-z]{2,3})/.test(EmailAddress)) {
		$(".response-EmailAddress").html("");
	} else {
		$(".response-EmailAddress").html("<h6 class='text-red'>Email address is not valid.</h6>");
	}
}

function validate_Password(Password) {
	if(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@#$%_-]{6,8}$/.test(Password)) {
		$(".response-Password").html("");
	} else {
		$(".response-Password").html("<h6 class='text-red'>Invalid password, Password is 6 to 8 characters string with at least one digit, one upper case letter, one lower case letter and one special symbol (@#$%).</h6>");
	}
}

function validate_Repassword(Repassword) {
	if($.trim($("#Password").val()) == $.trim($("#Repassword").val())) {
		$(".response-Repassword").html("");
	} else {
		$(".response-Repassword").html("<h6 class='text-red'>Passwords doesn't match.</h6>");
	}
}

function validate_UserName(UserName) {
    if(/^[a-zA-Z]*$/.test(UserName)) {
        $(".response-UserName").html("");
    } else {
        $(".response-UserName").html("<h6 class='text-red'>Invalid user name, Only letters are allowed.</h6>");
    }
}

function validate_onFirstName() {
	var value = $(".response-FirstName").html();
	return value;
}

function validate_onLastName() {
	var value = $(".response-LastName").html();
	return value;
}

function validate_onMobile() {
	var value = $(".response-Mobile").html();
	return value;
}

function validate_onEmailAddress() {
	var value = $(".response-EmailAddress").html();
	return value;
}

function validate_onPassword() {
	var value = $(".response-Password").html();
	return value;
}

function validate_onUserName() {
    var value = $(".response-UserName").html();
    return value;
}

function fill_blank() {
    $(".response-FirstName").html("");
	$(".response-LastName").html("");
	$(".response-Mobile").html("");
	$(".response-EmailAddress").html("");
	$(".response-Password").html("");
	$(".response-Repassword").html("");
    $(".response-UserName").html("");
}