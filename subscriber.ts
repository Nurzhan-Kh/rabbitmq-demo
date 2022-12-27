import { connect } from "amqplib";

const run = async function () {
    try {
        //создаем connection
        const connection = await connect('amqp://localhost');
        //создаем канал
        const channel = await connection.createChannel();
        //создаем Exchange
        await channel.assertExchange('test', 'topic', {durable: true});
        //создаем очередь
        const queue = await channel.assertQueue('my-cool-queue', {durable: true});
        //создаем маршрут
        channel.bindQueue(queue.queue, 'test', 'my.command');
        //слушаем очередь
        channel.consume(queue.queue, (message) => {
            if (!message) {
                return;
            }
            console.log(message.content.toString());
            if (message.properties.replyTo) {
                console.log(message.properties.replyTo);
                //Прямой ответ в очередь из сообщения
                channel.sendToQueue(message.properties.replyTo, Buffer.from('Ответ'), {correlationId: message.properties.correlationId});
            }
           // channel.ack(message);
        },{noAck: true}) //автоматический ack(удаление из очереди? прочитанного сообщения)
    } catch (e) {
        console.error(e);
    }
    
};

run();