import { Body, Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { LikeService } from "./like.service";
import { AtGuard } from "src/common/guards/at.guard";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetUserId } from "src/common/decorators/get-user-id.decorator";
import { LikeDto } from "./dtos/like.dto";

@ApiTags('Like')
@Controller({
    path: 'like',
    version: "1"
})
export class LikeController{
    constructor(private readonly likeService: LikeService){}

    @UseGuards(AtGuard)
    @Post()
    @ApiOperation({summary: "Toggle Like"})
    @ApiResponse({status: 200, description: "Car Added to your Wishlist"})
    @ApiResponse({status: 404, description: "Car Not Found"})
    async toggleLike(
        @GetUserId() userId: string,
        @Body() dto: LikeDto
    ){
        return await this.likeService.toggleLike(userId, dto)
    }


    @UseGuards(AtGuard)
    @Delete('id')
    @ApiOperation({summary: "Remove Like"})
    @ApiResponse({status: 200, description: "Car Removed from your Wishlist"})
    @ApiResponse({status: 404, description: "Car Not Found"})
    async removeLike(
        @Param('id') id:string
    ){
        return await this.likeService.removeLike(id)
    }


}