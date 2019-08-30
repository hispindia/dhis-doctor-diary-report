exports.DHIS_URL_BASE = "https://uphmis.in/uphmis";
exports.username = "admin";
exports.password = "";

exports.program_doc_diary = "Bv3DaiOd5Ai";
exports.root_ou = "v8EzhiynNtf";
exports.attr_user = "fXG73s6W4ER";


exports.views = {
    login : "login",
    calendar : "calendar",
    entry : "entry",
    loading : "loader",
    settings: "settings"
};

exports.approval_status = {

    approved : "Approved",
    autoapproved : "Auto-Approved",
    rejected : "Rejected",
    resubmitted : "Re-submitted",
    pending2 : "Pending2",
    pending1 : "Pending1"
    
}

exports.approval_usergroup_level2_code="approval2ndlevel";
exports.approval_usergroup_level1_code="approval1stlevel";

exports.report_types = {

    approved: "approved",
    pending:"pending",
    rejected : "rejected"
}

exports.approval_status_de = "W3RxC0UOsGY";
exports.approval_rejection_reason_de = "CCNnr8s3rgE";

exports.de_sort_order_attribute="FB2lVmfRZ83";

exports.query_ddReport = function(ou,sdate,edate){

    return `
    select
    tei,
    max(ps.name) as speciality,
    max(ou.uid) as ouuid,
    max(ou.name) as facility,
    max(block.name) as block,
    max(district.name) as district,
    max(division.name) as division,
    array_agg(distinct concat(tea.uid,':',teav.value)) as attrlist,
    array_agg(distinct concat(de,':',devalue)) as delist
    from trackedentityattributevalue teav
    right join (
        select tei.organisationunitid,psi.programstageid,pi.trackedentityinstanceid as tei,de.uid as de,sum(tedv.value::float8) as devalue
        from programstageinstance psi
        inner join programinstance pi on pi.programinstanceid = psi.programinstanceid
        inner join trackedentitydatavalue tedv on tedv.programstageinstanceid = psi.programstageinstanceid
        inner join dataelement de on de.dataelementid = tedv.dataelementid
        inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
        where tedv.value ~ '^-?[0-9]+.?[0-9]*$' and tedv.value !='0'
        and de.valuetype = 'NUMBER'
	and psi.executiondate between '${sdate}' and '${edate}'
        and psi.programstageid in (select programstageid
                                   from programstage
                                   where programid in(select programid
                                                      from program
                                                      where uid = 'Bv3DaiOd5Ai')
                                  )
        and tei.organisationunitid in (select organisationunitid
                                       from organisationunit
					where path like '%${ou}%')
        group by pi.trackedentityinstanceid,psi.programstageid,de.uid,tei.organisationunitid

        union

        select tei.organisationunitid,psi.programstageid,pi.trackedentityinstanceid as tei,tedv.value,count(tedv.value)
        from programstageinstance psi
        inner join programinstance pi on pi.programinstanceid = psi.programinstanceid
        inner join trackedentitydatavalue tedv on tedv.programstageinstanceid = psi.programstageinstanceid
        inner join dataelement de on de.dataelementid = tedv.dataelementid
        inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
	and psi.executiondate between '${sdate}' and '${edate}'
        and de.uid in ('x2uDVEGfY4K')
        and psi.programstageid in (select programstageid
                                   from programstage
                                   where programid in(select programid
                                                      from program
                                                      where uid = 'Bv3DaiOd5Ai')
                                  )
        and tei.organisationunitid in (select organisationunitid
                                       from organisationunit
					where path like '%${ou}%')
        group by pi.trackedentityinstanceid,psi.programstageid,de.uid,tei.organisationunitid,tedv.value
    )tedv
    on teav.trackedentityinstanceid = tedv.tei
    inner join trackedentityattribute tea on tea.trackedentityattributeid = teav.trackedentityattributeid
    inner join programstage ps on ps.programstageid = tedv.programstageid
    inner join organisationunit ou on ou.organisationunitid = tedv.organisationunitid
    inner join organisationunit block on ou.parentid = block.organisationunitid
    inner join organisationunit district on block.parentid = district.organisationunitid
    inner join organisationunit division on district.parentid = division.organisationunitid

    group by tedv.tei,division.organisationunitid,district.organisationunitid,block.organisationunitid,ou.name
    order by speciality,division.name,district.name,block.name,ou.name
`

}


exports.query_jsonize = function(q){
    return `select json_agg(main.*) from (
            ${q}
            
        )main`;
}
