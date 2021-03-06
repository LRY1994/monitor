/**
 * Created by linruiyu on 2016/5/27.
 */
var pageSize=15;
var num;
var onNum=0;
var offNum=0;
var datalist =new Array();
var datasort=new Array();
var dataon=new Array();
var dataoff=new Array();
var online_Clinets_data=new Array();
var offline_Clinets_data=new Array();
var i=0;
$(function(){

    getData(); //同步一次性取全部数据


    //点击“查询单个客户”时才出现输入框
    $('#single').click(function(e){
        e.preventDefault();
        $('#singleForm').slideToggle();
        return false;
    });

    //查询单个客户
    $('#search').click(function(e){
        e.preventDefault();
        $('#index_pic').hide();
        $('#picContainer').hide();
        $('#hashContainer').hide();
        $('#tableContainer').show();
        var clinetId=$('#singleId').val();
        console.log(clinetId);
        var url="http://172.16.38.169:8089/client/status/"+clinetId;
        console.log(url);
        $.ajax(
            {
                async:true,//使用同步的Ajax请求
                type:"GET",
                //url:url,
                url:"data2.json",
                dataType:"json",
                success:function(data){
                    //如果用户存在
                    var txtHtml="";
                    if(data['clientId']!=null){
                        $('ul.pagination').hide();

                        if(data.status=="online")
                            txtHtml+='<tr class="success"><td>'+data['clientId']+'</td><td>'+data['status']+'</td><td>'+data['timestamp']+'</td></tr>';
                        else
                            txtHtml+='<tr><td>'+data['clientId']+'</td><td>'+data['status']+'</td><td>'+data['timestamp']+'</td></tr>';
                        $('#table').html(txtHtml);
                    }
                    //如果用户不存在
                    else{
                        $('#tableContainer').hide();
                        txtHtml='<p style="text-align: center;margin: 0.7em 0 1em 0;font-size: 2em;background:steelblue;color:#ffffff;" >您查找的用户不存在</p>';
                        $('#content').html(txtHtml);
                    }
                }
            }
        )

    });

    //查询所有客户
    $('#all').click(allClient);

    //上线、下线客户数目饼状图
   $('#pie').click(function(e){
       e.preventDefault();
       $('#index_pic').hide();
       $('#tableContainer').hide();
       $('#picContainer').show();
       $('#hashContainer').hide();
       $('#picContainer').highcharts({
           chart: {
               plotBackgroundColor: null,
               plotBorderWidth: null,
               plotShadow: false,
               events: {
                   load: function () {
                       // 图表每秒更新一次
                       var series = this.series[0];
                       setInterval(function () {
                           $.ajax(
                               {
                                   async:true,//使用同步的Ajax请求
                                   type:"GET",
                                   url:"data.json",
                                   //url:url,
                                   dataType:"json",
                                   success:function(data){
                                       num=data['total'];
                                       datalist=data['data'];
                                       datasort=datalist.sort(cmp);
                                       onNum=0;
                                       offNum=0;
                                       online_Clinets_data=[];
                                       offline_Clinets_data=[];
                                       for(var h=0;h<num;h++){
                                           if(datalist[h]['status']=='online') {
                                               onNum++;
                                               online_Clinets_data.push(datalist[h]);
                                           }

                                           else {
                                               offNum++;
                                               offline_Clinets_data.push(datalist[h]);
                                           }
                                       }
                                       var data = [];
                                       data.push(['online', 100*onNum/num]);
                                       data.push(['offline', 100*offNum/num]);
                                       series.setData(data);
                                       console.log(data);

                                   },
                                   error:function(XMLHttpRequest, textStatus, errorThrown) {
                                       console.log(XMLHttpRequest.status);
                                       console.log(XMLHttpRequest.readyState);
                                       console.log(textStatus);
                                   }
                               }
                           );

                       }, 1000);
                   }
               }
           },
           title: {
               text: '上线、下线客户对比'
           },

           tooltip: {
               pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
           },
           plotOptions: {
               pie: {
                   allowPointSelect: true,
                   cursor: 'pointer',
                   dataLabels: {
                       enabled: true,
                       color: '#000000',
                       connectorColor: '#000000',
                       format: '<b>{point.name}</b>:{point.percentage:.1f} %'
                   },
                   events:{
                       click:function(e){
                          if(e.point.name=='online') onlineClient();
                           if(e.point.name=='offline')  offlineClient();
                       }
                   }
               }
           },
           credits:{
               enabled:false // 禁用版权信息
           },
           series: [{
               type: 'pie',
              // name: 'online vs offline',
               data: [
                   [
                       "online", 100*offNum/num
                   ],
                   [
                       "offline",100*onNum/num
                   ]


               ]
           }]
       });
   });

    //时间排序函数
    function cmp(d1,d2){
        var da1=Date.parse(d1.timestamp);
        var da2=Date.parse(d2.timestamp);
        return da1-da2;
    }


    //online,offline时间分布.日期为横坐标，小时分钟为纵坐标
    $('#hash').click(function(e) {
        getData();//获得数据
        e.preventDefault();
        $('#index_pic').hide();
        $('#tableContainer').hide();
        $('#picContainer').hide();
        $('#hashContainer').show();
        var str = new Array(num);
        dataon=[];
        dataoff=[];
        for (var ii = 0; ii < num; ii++) {
            var temp = datasort[ii]['timestamp'].split(' ');
            var yy = parseInt(temp[1].substr(0, 2)) * 3600 + parseInt(temp[1].substr(3, 2)) * 60 + parseInt(temp[1].substr(6, 2));
            yy = yy * 1000;
            var arr=temp[0].split('-');
            var d=Date.UTC(arr[0],arr[1]-1,arr[2]);
            //str.push(d);
            console.log("d="+d);
            console.log("yy="+yy);
            console.log("behind");
            if (datasort[ii]['status'] == 'online') {
                dataon.push([d,yy]);

            }
            else {
                dataoff.push([d,yy]);

            }
        }




        $('#hashContainer').highcharts({
            chart: {
                type: 'scatter',
                zoomType: 'xy',
                events: {
                    load: function () {
                        // 图表每秒更新一次
                        var series = this.series[0];
                        dataon=[];
                        dataoff=[];
                        setInterval(function () {
                            $.ajax(
                                {
                                    async:true,//使用同步的Ajax请求
                                    type:"GET",
                                    url:"data.json",
                                    //url:url,
                                    dataType:"json",
                                    success:function(data){
                                        num=data["total"];
                                        var str = new Array(num);
                                        dataon=[];//清空
                                        dataoff=[];//清空
                                        for (var ii = 0; ii < num; ii++) {
                                            var temp = datasort[ii]['timestamp'].split(' ');
                                            var yy = parseInt(temp[1].substr(0, 2)) * 3600 + parseInt(temp[1].substr(3, 2)) * 60 + parseInt(temp[1].substr(6, 2));
                                            yy = yy * 1000;
                                            var arr=temp[0].split('-');
                                            var d=Date.UTC(arr[0],arr[1]-1,arr[2]);
                                            //str.push(d);
                                            if (datasort[ii]['status'] == 'online') {
                                                dataon.push([d,yy]);

                                            }
                                            else {
                                                dataoff.push([d,yy]);

                                            }
                                            console.log("d="+d);
                                            console.log("yy="+yy);
                                        }
                                        var data=[];
                                        var online={};
                                        var offline=[];
                                        online.name="online";
                                        online.color="rgba(223, 83, 83, .5)";
                                        online.data=dataon;
                                        offline.name="offline";
                                        offline.color="rgba(119, 152, 191, .5)";
                                        offline.data=dataoff;
                                        data.push(online);
                                        data.push(offline);

                                    },
                                    error:function(XMLHttpRequest, textStatus, errorThrown) {
                                        console.log(XMLHttpRequest.status);
                                        console.log(XMLHttpRequest.readyState);
                                        console.log(textStatus);
                                    }
                                }
                            );

                        }, 1000);
                    }
                }
            },
            title: {
                text: '上线/下线时间分布'
            },
            subtitle: {
                text: '横坐标是日期,纵坐标是时间点'
            },
            xAxis: {
                type: 'datetime',
                //categories: str,
                title: {
                    text: '日期'
                }
                //,
                //
                //dateTimeLabelFormats: {
                //    millisecond: '%Y:%m:%d'
                //}
               // pointInterval: 24 * 3600 * 1000

            },
            yAxis: {
                title: {
                    text: '时间'
                },
                type: 'datetime'
                //dateTimeLabelFormats: {
                //    millisecond: '%H:%M:%S.%L'
                //}

            },
            legend: {
                layout: 'horizontal',
                align: 'left',
                verticalAlign: 'top',
                floating: true,
                backgroundColor: '#FFFFFF',
                borderWidth: 1
            },
            credits:{
                enabled:false // 禁用版权信息
            },
            scrollBar: {
                enabled: true
            },

            plotOptions: {

                scatter: {
                    marker: {
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {

                        shared: true,
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x:%Y-%m-%d},{point.y:%H:%M:%S} '


                    }
                }
            },
            series: [{
                name: 'online',
                color: 'rgba(223, 83, 83, .5)',
                data: dataon


            }, {
                name: 'offline',
                color: 'rgba(119, 152, 191, .5)',
                data: dataoff

            }]
        });

    });

    //查询在线用户
    $('#online_clients').click(function(e){
        getData();//获得数据
        e.preventDefault();
        onlineClient();
    });
    //查询离线用户
    $('#offline_clients').click(function(e){
        getData();//获得数据
        e.preventDefault();
        offlineClient();
    });


    //一次性取全部数据，因为后面都是用这同一个数据就不异步了
    function getData(){
        var url="http://172.16.38.169:8089/client/statusList";
        $.ajax(
            {
                async:true,//使用同步的Ajax请求
                type:"GET",
               url:"data.json",
                //url:url,
                dataType:"json",
                success:function(data){
                    num=data['total'];
                    datalist=data['data'];
                    datasort=datalist.sort(cmp);
                    onNum=0;
                    offNum=0;
                    online_Clinets_data=[];
                    offline_Clinets_data=[];
                    for(var h=0;h<num;h++){
                        if(datalist[h]['status']=='online') {
                            onNum++;
                            online_Clinets_data.push(datalist[h]);
                        }

                        else {
                            offNum++;
                            offline_Clinets_data.push(datalist[h]);
                        }
                    }

                },
                error:function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest.status);
                    console.log(XMLHttpRequest.readyState);
                    console.log(textStatus);
                }
            }
        );
        //setTimeout('getData()',4000);
        console.log("getData()");
    }

    //展示所有客户
    function allClient(){
        getData();//获得数据
        $('#index_pic').hide();
        $('#singleForm').hide();
        $('#picContainer').hide();
        $('#hashContainer').hide();
        $('#tableContainer').show();
        $('#callBackPager').show();
        gotoPage(1,datalist);
        $('#callBackPager').extendPagination({
            totalCount: num,
            showCount:num/pageSize,
            limit: pageSize,
            callback: function (curr, limit, totalCount) {
                gotoPage(curr,datalist);
            }
        });

        return false;
    }

    // 转到第几页
    function gotoPage(pn,data){
        var start=(pn-1)*pageSize;
        var end=start+pageSize;
        end=Math.min(end,data.length);
        $('#table').empty();
        var txtHtml="";
        var items=data;
        for(var k=start;k<end;k++){
            var item=items[k];
            if(item['status']=="online") {
                txtHtml += '<tr class="success"><td>' + item['clientId'] + '</td><td>' + item['status'] + '</td><td>' + item['timestamp'] + '</td>';
            }
            else {
                txtHtml += '<tr><td>' + item['clientId'] + '</td><td>' + item['status'] + '</td><td>' + item['timestamp'] + '</td>';
            }
        }
        $('#table').html(txtHtml);
    }

    //展示在线用户
    function onlineClient(){
        getData();//获得数据
        $('#index_pic').hide();
        $('#singleForm').hide();
        $('#picContainer').hide();
        $('#hashContainer').hide();
        $('#tableContainer').show();
        gotoPage(1,online_Clinets_data);
        $('#callBackPager').extendPagination({
            totalCount: onNum,
            showCount: onNum/pageSize,
            limit: pageSize,
            callback: function (curr, limit, totalCount) {
                gotoPage(curr,online_Clinets_data);
            }
        });
    }

    //展示离线用户
    function offlineClient(){
        getData();//获得数据
        $('#index_pic').hide();
        $('#singleForm').hide();
        $('#picContainer').hide();
        $('#hashContainer').hide();
        $('#tableContainer').show();
        gotoPage(1,offline_Clinets_data);
        $('#callBackPager').extendPagination({
            totalCount: offNum,
            showCount: offNum/pageSize,
            limit: pageSize,
            callback: function (curr, limit, totalCount) {
                gotoPage(curr,offline_Clinets_data);
            }
        });
    }



});




