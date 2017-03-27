function listSubCountry(){
	var c_code = document.getElementById("country").value;
	var fao_code = document.getElementById("faoarea").value;
	
	$("#funcGrptable").find("tr:gt(0)").remove();
	$('#subcountry').empty();
	$('#subcountry').append($('<option>', {
		text: "Select",
		value: ""
	}));
	$('#subcountry').prop( "disabled", false );
	
	if(c_code!= ""){
		var subArr = [];		//put the distinct subcountry in the array
		
		$.ajax({
		type: 'GET',
		url: "http://fin-casey.github.io/data/subcountryFao.json",
		async:false,
		success: function (result) {
			
			var filter = $.grep(result, function(element,index){
				return (element.C_Code == c_code && element.AreaCode > 10);
			});
			
			var len = Object.keys(filter).length;
			
			if(len > 0){
				$.each(filter, function(index, element){
					if ($.inArray(element.CSub_Code,subArr) === -1) {
						subArr.push(element.CSub_Code);
						$('#subcountry').append($('<option>', {
							text: element.CountrySub,
							value: element.CSub_Code
						}));
					}
				});
			}else{
				$('#subcountry').prop( "disabled", true );
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(textStatus);
		}
		});
		
		listFao();
	}
}

function listFao(hasSubCountry = false){
	var c_code = document.getElementById("country").value;
	var c_subcode = document.getElementById("subcountry").value;
	var file = "http://fin-casey.github.io/data/faoarea.json";
	
	$('#faoarea').empty();
	$('#faoarea').append($('<option>', {
		text: "Select",
		value: ""
	}));
	
	if(hasSubCountry && c_subcode != ""){
		file = "http://fin-casey.github.io/data/subcountryFao.json";
	}
	
	if(c_code != ""){	
		$.ajax({
		type: 'GET',
		url: file,
		async:false,
		success: function (result) {
			
			if(hasSubCountry && c_subcode != ""){
				var filter = $.grep(result, function(element,index){
					return (element.CSub_Code == c_subcode && element.AreaCode > 10);
				});
			}else{
				var filter = $.grep(result, function(element,index){
					return (element.C_Code == c_code && element.AreaCode > 10);
				});
			}
			
			$.each(filter, function(index, element){
				$('#faoarea').append($('<option>', {
					text: element.FAO,
					value: element.AreaCode
				}));
			});
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(textStatus);
		}
		});
	}
}

function selectFunctionalGroup(cb){
	var whatgroup = $(cb).attr('id');
	var groupNum = whatgroup.replace('selected','');
	
	if(cb.checked){
		document.getElementById("group"+groupNum).style.backgroundColor = "White";
		document.getElementsByName("sample"+groupNum)[0].disabled = false;
		document.getElementsByName("sample"+groupNum)[1].disabled = false;
		var spcount = document.getElementsByName(groupNum+"species").length;
		for(var a=0; a<spcount; a++){
			document.getElementsByName(groupNum+"species")[a].disabled = false;
		}
		
		var arrayOfEdit = $('#group'+groupNum+' img').map(function(){
			return this;
		}).get();
		
		$(arrayOfEdit[0]).attr('onclick', 'changeFname("'+groupNum+'fgroupname")');
		$(arrayOfEdit[1]).attr('onclick', 'changeSpecies("'+groupNum+'")');
		
	}else{
		document.getElementById("group"+groupNum).style.backgroundColor = "LightGrey";
		document.getElementsByName("sample"+groupNum)[0].disabled = true;
		document.getElementsByName("sample"+groupNum)[1].disabled = true;
	
		var spcount = document.getElementsByName(groupNum+"species").length;
		for(var a=0; a<spcount; a++){
			document.getElementsByName(groupNum+"species")[a].disabled = true;
			document.getElementsByName(groupNum+"species")[a].checked = false;
		}
		
		$('#group'+groupNum+' img').each(function(index){
			$(this).prop('onclick',null).off('click');
		
		});
		
		$('#group'+groupNum+' input[type=text]').each(function(index){
			$(this).remove();
		});
		
		$('#group'+groupNum+' input[type=button]').each(function(index){
			$(this).remove();
		});
	}

}

function populateFuncTable(){
	var selected = $("input[name=choose]:checked").val();
	var urldata = '';
	
	if(selected == "eco"){
		var e_code = document.getElementById("ecosystem").value;
		if(e_code == ''){
			$("#funcGrptable").find("tr:gt(0)").remove();
		}else{
			urldata = "http://fin-casey.github.io/data/ecosystem_funcgrp.json";
		}
	}else if(selected == "cntry")
	{
		var c_code = document.getElementById("country").value;
		var area_code = document.getElementById("faoarea").value;
		
		if(c_code == '' || area_code == ''){
			$("#funcGrptable").find("tr:gt(0)").remove();
		}else{
			urldata = "http://fin-casey.github.io/data/countryFAO_funcgrp.json";
		}
	}
		
	if(urldata != ''){
		$("#funcGrptable").find("tr:gt(0)").remove();
		$.ajax({
		type: 'GET',
		url: urldata,
		async:false,
		success: function (result) {
			var filter = $.grep(result, function(element,index){
				if(selected == "eco")	return (element.C_Code == c_code);
				else					return (element.AreaCode == area_code);
			});
			
			var len = Object.keys(filter).length;
			var grpcount = 0;
			var curName = '';
			var spcount = 0;
			var classnamesstr = '';
			var curspstr = '';
			var cursizestr = '';
			var curhabstr = '';
			var curdepthstr = '';
			
			var textToInsert = [];
			var i = 0;
			
			if(len > 0){
				$.each(filter, function(index, element){
					
					var curclass = element.Class;
					var genspec = element.Genus + ' ' + element.Species;
					var genspecval = element.Genus + element.Species.slice(0,1).toUpperCase() + element.Species.slice(1) + element.SpecCode +'Fb';
					//console.log(genspecval);
					var cursize = parseFloat(element.LengthEstimate);
					var curhabitat = element.Habitat;
					var curdepthshallow = element.DepthRangeShallow;
					var curdepthdeep = element.DepthRangeDeep;
					var prevFName = curName;
					
					if (curName != element.FuncGroup) {
						
						if((curName != '' && curName != element.FuncGroup)){
							grpcountstr = ""+grpcount+"";
							curspstr += '</div><div class="overflow-hidden"><img class="imgSize25" src="images/edit.png" onClick="changeSpecies(\''+grpcountstr+'\');"></div></td>';
							textToInsert[i++] = classnamesstr + '</td>';
							textToInsert[i++] = curspstr;
							textToInsert[i++] = cursizestr +'</td>';
							textToInsert[i++] = curhabstr+'</td>';
							textToInsert[i++] = curdepthstr+'</td>';
							textToInsert[i++] = '</tr>';
						}
						curName = element.FuncGroup;
						grpcount++;
						spcount = 0;
						var grpid = grpcount+"fgroupname";
						var depthid = 'td'+grpcount+'depth';
						
						textToInsert[i++] = '<tr id="group'+grpcount+'">';
						textToInsert[i++] = '<td><div class="center"><input type="checkbox" name="selectedgroup" id="selected'+grpcount+'" value="'+curName+'" onclick="selectFunctionalGroup(this);" checked></div></td>';
						textToInsert[i++] = '<td id="'+grpid+'"><span>'+curName+'</span><div class="floatRight"><img class="imgSize25" src="images/edit.png" onClick="changeFname(\''+grpid+'\');"></div></td>';
						textToInsert[i++] = '<td><div class="center"><input type="radio" name="sample'+grpcount+'" value="fgroup" checked></input></div></td>';
						textToInsert[i++] = '<td><div class="center"><input type="radio" name="sample'+grpcount+'" value="bgroup"></input></div></td>';
						classnamesstr = '<td id="td'+grpcount+'class"><input type="checkbox" class="hide" name="'+grpcount+'class" value="'+curclass+'" id="'+spcount+'td'+grpcount+'class">'+curclass;
						curspstr = '<td id="td'+grpcount+'species">';
						curspstr += '<div class="floatLeft width80 overflow-hidden">';
						curspstr += '<input type="checkbox" name="'+grpcount+'species" value="'+genspecval+'" id="'+spcount+'td'+grpcount+'species" checked><i>'+genspec+'</i>';
						cursizestr = '<td id="td'+grpcount+'size"><input type="checkbox" class="hide" name="'+grpcount+'size" value="'+cursize+'" id="'+spcount+'td'+grpcount+'size">'+cursize;
						//cursizestr = '<td id="td'+grpcount+'size"><span class="margin3top margin3bottom">'+cursize+'</span>';
						curhabstr = '<td id="td'+grpcount+'habitat"><input type="checkbox" class="hide" name="'+grpcount+'habitat" value="'+curhabitat+'" id="'+spcount+'td'+grpcount+'habitat">'+curhabitat;
						//curhabstr = '<td id="td'+grpcount+'habitat"><span class="margin3top margin3bottom">'+curhabitat+'</span>';
						curdepthstr = '<td id="'+depthid+'"><input type="checkbox" class="hide" name="'+grpcount+'depth" value="" id="'+spcount+depthid+'">';
						//curdepthstr = '<td id="'+depthid+'"><span class="margin3top margin3bottom">';
						
						if(curdepthshallow == '' || curdepthshallow == 0){
							if(curdepthdeep == null || curdepthdeep == 0){
								curdepthstr += '<br/>';
							}else{
								curdepthstr += curdepthdeep;
							}
						}else{
							if(curdepthdeep == null || curdepthdeep == 0){
								curdepthstr += curdepthshallow;
							}else{
								curdepthstr += curdepthshallow+ "-" +curdepthdeep;
							}
						}
						curdepthstr += '</span>';
					}else{		// the next species is included in the previous functional group
					
						spcount++;
						curspstr += '<br/><input type="checkbox" name="'+grpcount+'species" value="'+genspecval+'" id="'+spcount+'td'+grpcount+'species" checked><i>'+genspec+'</i>';
						classnamesstr += '<br/><input type="checkbox" class="hide" name="'+grpcount+'class" value="'+curclass+'" id="'+spcount+'td'+grpcount+'class">' + curclass;
						//classnamesstr += '<br/><p>' + curclass + '</p>';
						cursizestr += '<br/><input type="checkbox" class="hide" name="'+grpcount+'size" value="'+cursize+'" id="'+spcount+'td'+grpcount+'size">'+cursize;
						//cursizestr += '<br/><span class="margin3top margin3bottom">'+cursize +'</span>';
						curhabstr += '<br/><input type="checkbox" class="hide" name="'+grpcount+'habitat" value="'+curhabitat+'" id="'+spcount+'td'+grpcount+'habitat">'+curhabitat;
						//curhabstr += '<br/><span class="margin3top margin3bottom">'+curhabitat+'</span>';
						
						curdepthstr += '<br/><input type="checkbox" class="hide" name="'+grpcount+'depth" value="" id="'+spcount+depthid+'">';
						
						if(curdepthshallow == '' || curdepthshallow == 0){
							if(curdepthdeep == null || curdepthdeep == 0){
							}else{
								curdepthstr += curdepthdeep;
							}
						}else{
							if(curdepthdeep == null || curdepthdeep == 0){
								curdepthstr += curdepthshallow;
							}else{
								curdepthstr += curdepthshallow+"-" + curdepthdeep;
							}
						}
					}
					
					if(index == len-1){
						classnamesstr += '</td>';
						curspstr += '</div><div class="overflow-hidden"><img class="imgSize25" src="images/edit.png" onClick="changeSpecies(\''+grpcount+'\');"></div></td>';
						textToInsert[i++] = classnamesstr;
						textToInsert[i++] = curspstr;
						textToInsert[i++] = cursizestr +'</td>';
						textToInsert[i++] = curhabstr+'</td>';
						textToInsert[i++] = '<td id="td'+grpcount+'depth"></td>';
						textToInsert[i++] = '</tr>';
					}
				});
				$('#funcGrptable').append(textToInsert.join(''));
			}else{
				//no data for functional group
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(textStatus);
		}
		}); //end of ajax
	}
}

function changeEcoOrCountry(){
	var selected = $("input[name=choose]:checked").val();
	
	if(selected == "eco"){
		document.getElementById("ecoDiv").style.backgroundColor = "White";
		document.getElementById("ecosystem").disabled = false;
		
		document.getElementById("country").disabled = true;
		document.getElementById("subcountry").disabled = true;
		document.getElementById("faoarea").disabled = true;
		
		$("#country").val("none");
		
		$('#subcountry').empty();
		$('#subcountry').append($('<option>', {
			text: "Select",
			value: "none"
		}));
			
		$('#faoarea').empty();
		$('#faoarea').append($('<option>', {
			text: "Select",
			value: "none"
		}));
		
		
	}else{
		document.getElementById("countryDiv").style.backgroundColor = "White";
		document.getElementById("country").disabled = false;
		document.getElementById("subcountry").disabled = false;
		document.getElementById("faoarea").disabled = false;
		
		document.getElementById("ecosystem").disabled = true;
		
		$("#ecosystem").val("none");
	}

}

function validateform1(){
	if(document.stepForm.choose.value == "eco"){
		if(document.stepForm.ecosystem.value == ""){
			alert("Please select an ecosystem!");
			document.stepForm.ecosystem.focus();
			return false;
		}
		return true;
	}
	if(document.stepForm.choose.value == "cntry"){
		if(document.stepForm.country.value == ""){
			alert("Please select a country!");
			document.stepForm.country.focus();
			return false;
		}
		if(document.stepForm.faoarea.value == ""){
			alert("Please select a FAO Area!");
			document.stepForm.subcountry.focus();
			return false;
		}
		return true;
	}
}

function changeNext(current, targetNext){
	var steps = $(document.body).find("fieldset");
    var count = steps.size();

	var stepName = "step" + current;
	$("#" + stepName + "Next").unbind("click");
	
	$("#" + stepName + "Next").bind("click", function(e) {
		$("#" + stepName).hide();
		$("#step" + targetNext).show();
	});
}

function changePrev(current, targetPrev){

	var stepName = "step" + current;
	$("#" + stepName + "Prev").unbind("click");
	
	$("#" + stepName + "Prev").bind("click", function(e) {
		$("#" + stepName).hide();
		$("#step" + targetPrev).show();
	});
}

function populateProp(ctr, gen, sp, a){
	var species = "https://fishbase.ropensci.org/species?fields=Length,DemersPelag,DepthRangeShallow,DepthRangeDeep,SpecCode";
	
	var out;
	var sizeid;
	var habitatid;
	var depthid;
	
	//urlsp = species + "&genus=" + gen + "&species=" + sp;
	urlsp = "http://fin-casey.github.io/data/ecosystem_funcgrp.json";
	
	$.ajax({
		type: 'GET',
		url: urlsp,
		async:false,
		success: function (result){
			//out = result.data[0];
			sizeid= 'td'+ctr+'size';
			habitatid = 'td'+ctr+'habitat';
			depthid = 'td'+ctr+'depth';
			classid='td'+ctr+'class';
			var length = '';
			var habitat = '';
			var dshallow = '';
			var ddeep = '';
			var specCode = '';
			var className = '';
			
			/*var length = out['Length'];
			var habitat = out['DemersPelag'];
			var dshallow = out['DepthRangeShallow'];
			var ddeep = out['DepthRangeDeep'];
			var specCode = out['SpecCode'];*/
			
			var filter = $.grep(result, function(element,index){
				return (element.Genus == gen && element.Species == sp);
			});
			
			var len = Object.keys(filter).length;
			
			if (len > 0){
				var element = filter[0];
				length = element.LengthEstimate;
				habitat = element.Habitat;
				dshallow = element.DepthRangeShallow;
				ddeep = element.DepthRangeDeep;	
				specCode = element.SpecCode;
				className = element.Class;
				
				$('#'+classid).append('<br/><input type="checkbox" class="hide" name="'+ctr+'class" value="'+className+'" id="'+a+classid+'">'+className);
				$('#'+sizeid).append('<br/><input type="checkbox" class="hide" name="'+ctr+'size" value="'+length+'" id="'+a+sizeid+'">'+length);
				$('#'+habitatid).append('<br/><input type="checkbox" class="hide" name="'+ctr+'habitat" value="'+habitat+'" id="'+a+habitatid+'">'+habitat);
				
				var depthtext = '<br/><input type="checkbox" class="hide" name="'+ctr+'depth" value="" id="'+a+depthid+'">';
				
				if(dshallow == null || dshallow == 0){
					if(ddeep == null || ddeep == 0){
						$('#'+depthid).append(depthtext);
					}else{
						$('#'+depthid).append(depthtext+ddeep);
					}
				}else{
					if(ddeep == null || ddeep == 0){
						$('#'+depthid).append(depthtext+dshallow);
					}else{
						$('#'+depthid).append(depthtext+dshallow+"-" + ddeep);
					}
				}
				//output = out['SpecCode'];		//return speccode
				output = specCode;
				
			}else{
				alert("Can't find the species!"+"\n"+"Please go to fishbase.org or sealifebase.org to find alternative matches.");
				output = false;
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("Can't find the species!"+"\n"+"Please go to fishbase.org or sealifebase.org to find alternative matches.");
			output = false;
		}
	});
	return output;
}

function deselect(ctr) {
  $('#message'+ctr).slideFadeToggle(function() {
	var msgicon = $('#info'+ctr);
    msgicon.removeClass('selected');
  });    
}

function closeSelected(){
	$('.selected').each(function(index){
		var ctrpopup = $(this).attr('id').slice(-1);
		
		deselect(ctrpopup);
	});
}

function msgpop(ctr){
	
	var msgicon = $('#info'+ctr);
	var msg = $('#message'+ctr);
	
	if(msgicon.hasClass('selected')){
		deselect(ctr);
	}else{
		closeSelected();
		msgicon.addClass('selected');
		msg.slideFadeToggle();
	}
	return false;
}

$.fn.slideFadeToggle = function(easing, callback) {
  return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
};
/*
$(document).mouseup(function (e)
{
	if($('.selected')[0]){
		var ctrpopup = $('.selected').attr('id').slice(-1);
		var container = $('#message'+ctrpopup);
		
		if (!container.is(e.target) // if the target of the click isn't the container...
			&& container.has(e.target).length === 0) // ... nor a descendant of the container
		{
			closeSelected();
		}
	}
});
*/
function changeFname(fname){
	$('input[name=new]').remove();
	$('input[name=OKbtn]').remove();
	var prev = $('#'+fname).text();
	
	$('#'+fname).empty();
	$('#'+fname).append($('<input>', {
		type: "text",
		name: "new",
		value: prev,
		size: "8px",
		onkeypress: "return saveFname('"+fname+"',event.keyCode)"
	}));
	
	$('#'+fname).append($('<input>', {
		type: "button",
		value: "OK",
		size: "5px",
		name: "OKbtn",
		onClick: "saveFname('"+fname+"',13);"
	}));
}

function saveFname(fn,e){
	if(e== 13){
		var newFname = $('input[name=new]').val();
		
		$('#'+fn).empty();
		$('#'+fn).append($('<span>', {
			text: newFname
		}));
		
		var div = $('<div>', {
			class: "floatRight"
		});
		
		$('#'+fn).append(div);
		div.prepend($('<img>', {
			class: "imgSize25",
			src: "edit.png",
			onClick: "changeFname('"+fn+"');"
		}))
		return false;
	}
}

function changeSpecies(spnum){
	$('input[name=new]').remove();
	$('input[name=OKbtn]').remove();
	$('#td'+spnum+'species div:nth-child(2)').remove();
	
	$('#td'+spnum+'species div:first-child').append("<br>");
	
	$('#td'+spnum+'species div:first-child').append($('<input>', {
		type: "text",
		name: "new",
		size: "8px",
		onkeypress: "return saveSname('"+spnum+"',event.keyCode)"
	}));
	
	$('#td'+spnum+'species div:first-child').append($('<input>', {
		type: "button",
		value: "OK",
		name: "OKbtn",
		onClick: "saveSname('"+spnum+"',13);"
	}));

}

function saveSname(snum,e){
	if(e== 13){
		var newSname = $('input[name=new]').val();
		var nextSp = document.getElementsByName(snum+"species").length;
		
		var genspecA = newSname.split(" ");
		
		if(genspecA.length < 2){
			alert("Invalid species name!");
			return false;
		}else{
			var gen = genspecA[0].slice(0,1).toUpperCase() + genspecA[0].slice(1);
			var sp = genspecA[1].toLowerCase();
			
			var genspec = gen + sp.slice(0,1).toUpperCase() + sp.slice(1);
			newSname = gen + " " + sp;
			
			$('input[name=new]').remove();
			$('input[name=OKbtn]').remove();
			
			var result = populateProp(snum, gen, sp, nextSp);
		
			if(result != false){
				$('#td'+snum+'species div:first-child').append($('<input>', {
					type: "checkbox",
					name: snum+"species",
					id: nextSp+"td"+snum+"species",
					value: genspec+result+'Fb',
					checked: "checked"
				}));
				
				$('#td'+snum+'species div:first-child').append($('<label>', {
					'for': nextSp+"td"+snum+"species",
					text: newSname
				}));
			}else{
				$('#td'+snum+'species br:last-child').remove();
			}
		}
		var div = $('<div>', {
			class: "overflow-hidden"
		});
			
		$('#td'+snum+'species').append(div);
		div.prepend($('<img>', {
			class: "imgSize25",
			src: "images/edit.png",
			onClick: "changeSpecies('"+snum+"');"
		}));
		
		return false;
	}		
}
/*
function addFGroup(){
	var nextgrp = document.getElementsByName("selectedgroup").length;
	
	$('table').append($('<tr>', {
		id: "group"+nextgrp	
	}));
	
	var nextTr = $('#group'+nextgrp);
	
	$(nextTr).append($('<td>'));
	
	var divFname = $('<div>', {
		class: "center"
	});
	
	$(nextTr+' td:last').append(divFname);
	divFname.prepend($('<input>', {
		type: "checkbox",
		name: "selectedgroup",
		id: "selected"+nextgrp,
		checked: "checked"
	}));
	
	$(nextTr).append($('<td>', {
		id: nextgrp+"fgroupname"
	}));

}*/

function validateformGroup(){
	var ctr = 1;
	var bgroup = false;
	var fgroup = false;
	
	while(document.getElementsByName("sample"+ctr).length > 0){
		if(fgroup == false && $("input[name='sample"+ctr+"']:checked").val() == "fgroup"){
			fgroup = true;
		}
		if(bgroup == false && $("input[name='sample"+ctr+"']:checked").val() == "bgroup"){
			bgroup = true;
		}
		ctr++;
	}
	
	if(fgroup == true && bgroup == true){
		return true;
	}else if(fgroup == false){
		alert("Please select at least one focal functional group.");
		return false;
	}else if(bgroup == false){
		alert("Please select at least one background functional group.");
		return false;
	}
}

function validateStep(){
	var steps = $('#stepsInput').val();

	if(steps == ""){
		alert("Please enter a valid number.");
		return false;
	}else return true;
}

function download(){
	/*change status label to process ongoing */
	var statusLabel = $('#status');
	statusLabel.empty();
	statusLabel.append("Preparing configuration...");
	statusLabel.css('color', 'black');
	
	var downloadEl = $('#downloadLink');
	downloadEl.html("&nbsp;");
	
	//time steps per year
	var steps = $('#stepsInput').val();
	
	//compile data
	var jsonArr = [];
	
	var groupctr = 1;
	var ctr;
	
	while(document.getElementsByName(groupctr+"species").length > 0){
		if($("#selected"+groupctr).is(':checked')){
			ctr = groupctr;
			var group1 = document.getElementsByName(ctr+"species");
			var len1 = group1.length;
			var gname = $('#'+ctr+'fgroupname span').text();
		
			var fgroup = ($("input[name='sample"+ctr+"']:checked").val() == "fgroup" ? "focal" : "background");
			var temp;
			
			var taxaArr = [];
			
			for(var a=0; a<len1; a++){
				if(group1[a].checked){
					var genspec = group1[a].value.match(/[A-Z]?[a-z]+|[0-9]+/g);
					var gen = genspec[0];	//genus
					var sp = genspec[1];	//species
					var id = genspec[2];	// speccode
					var link = (genspec[3] == "Fb" ? "http://fishbase.org/summary/"+id : "http://sealifebase.org/summary/"+id); 	//fb or slb
					var nameofspec = gen+' '+sp.slice(0,1).toLowerCase() + sp.slice(1);
					
					taxaArr.push({"name": nameofspec, "url": link});
				}
			}
			
			if(taxaArr.length > 0){
				jsonArr.push({
					"name": gname,
					"type": fgroup,
					"taxa": taxaArr
				});
			}
		}
		groupctr++;
	}
	
	var config = {
        "timeStepsPerYear" : steps,
        "groups" : jsonArr
    };
	
	//console.log(config);

	var generateConfig = osmose.generateConfig(config, function(err, url) {
		
		if(url != null){
			statusLabel.empty();
			statusLabel.append("Done preparing configuration");
			
			downloadEl.text("Click here to download Osmose configuration");
			downloadEl.attr("download", "osmose_config.zip");
			downloadEl.attr("href", url);
			
		}else{
			
			statusLabel.empty();
			statusLabel.append("Generating configuration is not successful.");
			statusLabel.css('color', 'red');
			
			var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
			
			downloadEl.text("Click here to download the configuration JSON");
			downloadEl.attr("download", "generated_config.json");
			downloadEl.attr("href", "data:'"+data + "'");
		}
    });
	
	return false;
}